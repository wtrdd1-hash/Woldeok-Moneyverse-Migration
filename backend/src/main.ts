import 'reflect-metadata';
import { json, raw, urlencoded } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { adminAuditTrail } from './admin/audit-trail.middleware';
import { AuditRepository } from './admin/audit.repository';
import { loadConfig } from './core/config';
import { requestContext } from './core/request-context';
import { ProblemFilter } from './core/problem.filter';
import { mountOpenApi } from './openapi';
import { applyServerTimeouts } from './server-timeouts';
import { sessionToken } from './auth/cookies';
import { SessionRepository } from './auth/session.repository';
import { attachLobby } from './lobby/lobby';
import { MARKET_ROOM, MarketBroadcast } from './stock/market-broadcast';
import { UNPREFIXED_ROUTES } from './http/prefix';
import { ActivityService } from './activity/activity.service';
import { PG_POOL } from './core/pool.provider';
import type { Queryable } from './core/db';
import { ipBlockGate } from './security/ip-block.middleware';
import { securityHeaders } from './security/security-headers.middleware';
import { requestActivityTrail } from './activity/request-activity.middleware';
import { AuctionGateway } from './marketplace/auction.gateway';
import { responseCompression } from './http/compression.middleware';
import { dynamicEtag } from './http/etag.middleware';
import { corsPolicy } from './security/cors-policy';

async function bootstrap(): Promise<void> {
  const config = loadConfig(process.env);
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Express advertises itself in every response by default. Naming the stack
  // and its version tells an attacker which advisories to try first and buys
  // a legitimate client nothing.
  app.getHttpAdapter().getInstance().disable('x-powered-by');

  // Enterprise Security Headers
  app.use(securityHeaders({ isProduction: config.production }));

  // High-performance HTTP compression (Gzip/Deflate for >1KB payloads)
  app.use(responseCompression());

  // Dynamic ETag & 304 Not Modified Caching for GET/HEAD
  app.use(dynamicEtag());

  // HTTP Keep-Alive optimization middleware
  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Keep-Alive', 'timeout=60, max=1000');
    next();
  });

  // CORS is a browser boundary, not a trusted-edge identity channel. Production
  // accepts only the configured public origin; loopback origins are a local
  // development convenience. Proxy-owned identity headers are deliberately
  // absent from allowedHeaders so browser JavaScript cannot author them.
  const cors = corsPolicy({ baseUrl: config.baseUrl, production: config.production });
  app.enableCors({
    origin: (origin, callback) => callback(null, cors.allowsOrigin(origin)),
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: [...cors.allowedHeaders],
  });

  // Global 1MB payload ceiling to prevent memory-exhaustion & ReDoS attacks
  app.use(json({ limit: '1mb' }));
  app.use(urlencoded({ extended: true, limit: '1mb' }));

  // Correlation first, so every audit row written while serving a request --
  // by the trail below or by a SECURITY DEFINER function three layers down --
  // carries the same request id. Spec 14.9 asks for that thread to exist.
  app.use(requestContext({ trustForwardedHeaders: config.trustProxyForwardedFor }));

  const ipBlockLog = new Logger('IpBlockGate');
  app.use(
    ipBlockGate({
      pool: app.get<Queryable | null>(PG_POOL, { strict: false }),
      trustForwardedFor: config.trustProxyForwardedFor,
      onFailure: (error) => ipBlockLog.error('IP block check failed', error),
    }),
  );

  const activityLog = new Logger('RequestActivity');
  app.use(
    requestActivityTrail({
      activity: app.get(ActivityService, { strict: false }),
      sessions: app.get(SessionRepository, { strict: false }),
      config,
      onFailure: (error) => activityLog.error('request activity was not recorded', error),
    }),
  );

  // Spec 14.9: every console view and execution is recorded, including the
  // request an authorization guard refused. Middleware rather than an
  // interceptor, for the reason written above adminAuditTrail.
  const auditTrailLog = new Logger('AdminAuditTrail');
  app.use(
    '/api/v1/admin',
    adminAuditTrail({
      repository: app.get(AuditRepository, { strict: false }),
      pepper: app.get<string>('ADMIN_DEVICE_PEPPER', { strict: false }),
      trustForwardedFor: config.trustProxyForwardedFor,
      onFailure: (error) => auditTrailLog.error('console access was not recorded', error),
    }),
  );

  // Raw bytes for the two paths whose bodies are not JSON to us. Discord
  // signs the exact request bytes, and a JSON round trip re-serialises key
  // order and whitespace, after which the Ed25519 check can never pass. The
  // photo upload is image data and PrivateImageStorage sniffs it itself.
  app.use('/api/v1/integrations/discord/interactions', raw({ type: '*/*', limit: '32kb' }));
  app.use('/api/v1/admin/photos', raw({ type: '*/*', limit: '8mb' }));
  // A member's gallery submission. Smaller than the operator's, because this
  // one is reachable by anybody signed in.
  app.use('/api/v1/photos/uploads', raw({ type: '*/*', limit: '4mb' }));
  app.use('/api/v1/board/images/uploads', raw({ type: '*/*', limit: '4mb' }));
  // A member's own picture, on the same terms as an operator's gallery
  // upload: the bytes arrive raw and `validateImageUpload` decides whether
  // they are an image. The cap is the smaller one because this is one avatar
  // per member and the store is not the place to discover that it was not.
  app.use('/api/v1/profile/image', raw({ type: '*/*', limit: '4mb' }));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      // enableImplicitConversion stays off. With it on, class-transformer
      // coerces a numeric string into a number -- precisely the conversion
      // that destroys a money value above 2^53.
      transformOptions: { enableImplicitConversion: false },
    }),
  );
  app.useGlobalFilters(new ProblemFilter(config.production));

  // /health keeps the short path a container probe has always used; every
  // other route lives under /api/v{n}.
  app.setGlobalPrefix('api', { exclude: [...UNPREFIXED_ROUTES] });
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  mountOpenApi(app, config.production);

  applyServerTimeouts(app.getHttpServer());

  // The lobby shares this listener. It is attached after the HTTP surface is
  // configured because Engine.IO re-wraps the server's own request and
  // upgrade listeners when it attaches, and it must wrap the finished ones.
  //
  // A null session store is not an error here: the lobby degrades to
  // read-only rather than refusing to start, which is what the public
  // landing page needs when the database is briefly unavailable.
  const io = attachLobby(app.getHttpServer(), {
    baseUrl: config.baseUrl,
    trustForwardedFor: config.trustProxyForwardedFor,
    sessions: app.get(SessionRepository, { strict: false }),
    sessionToken: (headers) => sessionToken(headers, config),
  });

  // The market's price push rides the same socket server. It is handed the
  // emitter here rather than creating one, because the lobby owns the
  // server's limits — connection caps, handshake rate, the origin check — and
  // a second server would be a second door with none of them.
  app.get(MarketBroadcast, { strict: false })?.attach(
    (event, payload) => io.to(MARKET_ROOM).emit(event, payload),
    () => (io.sockets.adapter.rooms.get(MARKET_ROOM)?.size ?? 0) > 0,
    (room, event, payload) => io.to(room).emit(event, payload),
    (room) => (io.sockets.adapter.rooms.get(room)?.size ?? 0) > 0,
  );

  const auctionGateway = app.get(AuctionGateway, { strict: false });
  if (auctionGateway) {
    auctionGateway.onBid((payload) => {
      io.to(`auction:${payload.auctionId}`).emit('auction:bid', payload);
    });
    auctionGateway.onAntiSniping((payload) => {
      io.to(`auction:${payload.auctionId}`).emit('auction:extended', payload);
    });
    auctionGateway.onOutbid((payload) => {
      io.to(`auction:${payload.auctionId}`).emit('auction:outbid', payload);
    });
  }

  // Loopback by default, not 0.0.0.0. This is an internal service; binding it
  // to every interface by default is how an "internal" service becomes
  // reachable from outside.
  await app.listen(config.port, process.env.HOST ?? '127.0.0.1');
}

void bootstrap();
