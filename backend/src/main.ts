import 'reflect-metadata';
import { raw } from 'express';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { loadConfig } from './core/config';
import { ProblemFilter } from './core/problem.filter';
import { mountOpenApi } from './openapi';
import { applyServerTimeouts } from './server-timeouts';
import { sessionToken } from './auth/cookies';
import { SessionRepository } from './auth/session.repository';
import { attachLobby } from './lobby/lobby';
import { MarketBroadcast } from './stock/market-broadcast';
import { UNPREFIXED_ROUTES } from './http/prefix';

async function bootstrap(): Promise<void> {
  const config = loadConfig(process.env);
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Express advertises itself in every response by default. Naming the stack
  // and its version tells an attacker which advisories to try first and buys
  // a legitimate client nothing.
  app.getHttpAdapter().getInstance().disable('x-powered-by');

  // Raw bytes for the two paths whose bodies are not JSON to us. Discord
  // signs the exact request bytes, and a JSON round trip re-serialises key
  // order and whitespace, after which the Ed25519 check can never pass. The
  // photo upload is image data and PrivateImageStorage sniffs it itself.
  app.use('/api/v1/integrations/discord/interactions', raw({ type: '*/*', limit: '32kb' }));
  app.use('/api/v1/admin/photos', raw({ type: '*/*', limit: '8mb' }));

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
  app
    .get(MarketBroadcast, { strict: false })
    ?.attach(
      (event, payload) => io.emit(event, payload),
      () => io.engine.clientsCount > 0,
    );

  // Loopback by default, not 0.0.0.0. This is an internal service; binding it
  // to every interface by default is how an "internal" service becomes
  // reachable from outside.
  await app.listen(config.port, process.env.HOST ?? '127.0.0.1');
}

void bootstrap();
