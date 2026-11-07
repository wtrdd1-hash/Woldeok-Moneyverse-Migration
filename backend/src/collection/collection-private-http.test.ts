import { Controller, ForbiddenException, Get, MiddlewareConsumer, Module, NestModule, UnauthorizedException, VersioningType } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { CollectionController } from './collection.controller';
import { CollectionModule } from './collection.module';
import { CollectionService } from './collection.service';

@Controller('public-probe')
class PublicProbeController {
  @Get()
  publicProbe() { return { ok: true }; }
}

@Module({
  controllers: [CollectionController, PublicProbeController],
  providers: [{ provide: CollectionService, useValue: {
    listCollections: async () => ({ pieces: [], unverifiedRecords: '1', verificationStatus: 'unavailable' }),
    updatePiece: async () => true,
    getCurationStatus: async () => ({ status: null, verificationStatus: 'unavailable' }),
    advanceCuration: async () => ({ status: 'test-only' }),
  } }],
})
class CollectionHttpFixture implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    const mod = new CollectionModule() as CollectionModule & { configure?: (consumer: MiddlewareConsumer) => void };
    mod.configure?.(consumer);
  }
}

describe('P1 owner collection HTTP security boundary', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const allow = { canActivate: () => true };
    const session = { canActivate: (ctx: { switchToHttp: () => { getRequest: () => { headers: Record<string, string>; session?: unknown } } }) => {
      const req = ctx.switchToHttp().getRequest();
      if (req.headers['x-test-owner'] !== '1') throw new UnauthorizedException('login required');
      req.session = { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', user_id: '11111111-1111-4111-8111-111111111111' };
      return true;
    } };
    const csrf = { canActivate: (ctx: { switchToHttp: () => { getRequest: () => { method: string; headers: Record<string, string> } } }) => {
      const req = ctx.switchToHttp().getRequest();
      if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && req.headers['x-csrf-token'] !== 'valid') {
        throw new ForbiddenException('csrf token required');
      }
      return true;
    } };
    const ref = await Test.createTestingModule({ imports: [CollectionHttpFixture] })
      .overrideGuard(SessionGuard).useValue(session)
      .overrideGuard(AuthenticatedGuard).useValue(allow)
      .overrideGuard(ConsentGuard).useValue(allow)
      .overrideGuard(CsrfGuard).useValue(csrf)
      .compile();
    app = ref.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    await app.init();
  });
  afterAll(async () => { await app?.close(); });

  it.each([
    ['/api/v1/collections', '1', 200],
    ['/api/v1/collections', '0', 401],
    ['/api/v1/collections/curation/status', '1', 200],
    ['/api/v1/collections/curation/status', '0', 401],
  ] as const)('GET %s owner=%s status=%s is private before guards', async (path, owner, status) => {
    const res = await request(app.getHttpServer()).get(path).set('x-test-owner', owner);
    expect(res.status).toBe(status);
    expect(res.headers['cache-control']).toBe('private, no-store');
    expect(res.headers['x-robots-tag']).toBe('noindex');
    expect(res.headers['referrer-policy']).toBe('no-referrer');
  });

  it.each(['put', 'post'] as const)('%s mutation requires CSRF and never permits caching', async (method) => {
    const path = method === 'put' ? '/api/v1/collections/123' : '/api/v1/collections/curation/advance';
    const rejected = await request(app.getHttpServer())[method](path).set('x-test-owner', '1').send({});
    expect(rejected.status).toBe(403);
    expect(rejected.headers['cache-control']).toBe('private, no-store');
    expect(rejected.headers['x-robots-tag']).toBe('noindex');
    const accepted = await request(app.getHttpServer())[method](path).set('x-test-owner', '1').set('x-csrf-token', 'valid').send({});
    expect(accepted.status).toBe(method === 'post' ? 201 : 200);
    expect(accepted.headers['cache-control']).toBe('private, no-store');
  });

  it('protects HEAD and leaves unrelated public routes unchanged', async () => {
    const head = await request(app.getHttpServer()).head('/api/v1/collections').set('x-test-owner', '1');
    expect(head.status).toBe(200);
    expect(head.headers['cache-control']).toBe('private, no-store');
    const pub = await request(app.getHttpServer()).get('/api/v1/public-probe');
    expect(pub.status).toBe(200);
    expect(pub.headers['cache-control']).toBeUndefined();
  });
});
