import { Global, Module, UnauthorizedException, VersioningType } from '@nestjs/common';
import { PG_POOL } from '../core/pool.provider';
import { AuthModule } from '../auth/auth.module';
import { EncryptionService } from '../security/encryption.service';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminSessionGuard } from '../auth/guards/admin-session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { SupportModule } from './support.module';
import { SupportRepository } from './support.repository';

const owner = '11111111-1111-4111-8111-111111111111';
const thread = '22222222-2222-4222-8222-222222222222';

@Global()
@Module({ providers: [{ provide: PG_POOL, useValue: null }, { provide: EncryptionService, useValue: {} }], exports: [PG_POOL, EncryptionService] })
class TestDatabaseDependencies {}

@Module({})
class TestAuthModule {}

describe('member and admin support private HTTP responses', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const allow = { canActivate: () => true };
    const session = {
      canActivate: (context: { switchToHttp: () => { getRequest: () => { headers: Record<string, string>; session?: unknown } } }) => {
        const req = context.switchToHttp().getRequest();
        if (req.headers['x-test-owner'] !== '1') throw new UnauthorizedException('login required');
        req.session = { id: '33333333-3333-4333-8333-333333333333', user_id: owner };
        return true;
      },
    };
    const repo = {
      myThreads: async () => [{ thread_id: thread, subject: 'private support' }],
      messages: async () => [{ message_id: thread, body: 'private message' }],
      adminThreads: async () => [{ thread_id: thread, subject: 'private support' }],
      adminMessages: async () => [{ message_id: thread, body: 'private message' }],
      createThread: async () => ({ thread_id: thread }),
    };
    const moduleRef = await Test.createTestingModule({ imports: [TestDatabaseDependencies, SupportModule] })
      .overrideModule(AuthModule).useModule(TestAuthModule)
      .overrideProvider(SupportRepository).useValue(repo)
      .overrideGuard(SessionGuard).useValue(session)
      .overrideGuard(AuthenticatedGuard).useValue(allow)
      .overrideGuard(ConsentGuard).useValue(allow)
      .overrideGuard(CsrfGuard).useValue(allow)
      .overrideGuard(AdminGuard).useValue(allow)
      .overrideGuard(AdminSessionGuard).useValue(allow)
      .compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    await app.init();
  });
  afterAll(async () => { await app?.close(); });

  it.each([
    ['/api/v1/support/threads', 200],
    [`/api/v1/support/threads/${thread}/messages`, 200],
    ['/api/v1/admin/support/threads', 200],
    [`/api/v1/admin/support/threads/${thread}/messages`, 200],
  ] as const)('protects successful GET %s', async (path, status) => {
    const res = await request(app.getHttpServer()).get(path).set('x-test-owner', '1');
    expect(res.status).toBe(status);
    expect(res.headers['cache-control']).toBe('private, no-store');
    expect(res.headers['x-robots-tag']).toBe('noindex');
    expect(res.headers['referrer-policy']).toBe('no-referrer');
  });

  it.each([
    '/api/v1/support/threads',
    '/api/v1/admin/support/threads',
  ])('protects guard-denied GET %s', async (path) => {
    const res = await request(app.getHttpServer()).get(path);
    expect(res.status).toBe(401);
    expect(res.headers['cache-control']).toBe('private, no-store');
    expect(res.headers['x-robots-tag']).toBe('noindex');
    expect(res.headers['referrer-policy']).toBe('no-referrer');
  });

  it('protects member creation and HEAD responses', async () => {
    const post = await request(app.getHttpServer()).post('/api/v1/support/threads')
      .set('x-test-owner', '1')
      .send({ subject: 'subject', body: 'message', idempotencyKey: '44444444-4444-4444-8444-444444444444' });
    expect(post.status).toBe(201);
    const head = await request(app.getHttpServer()).head('/api/v1/support/threads').set('x-test-owner', '1');
    expect(head.status).toBe(200);
    for (const res of [post, head]) {
      expect(res.headers['cache-control']).toBe('private, no-store');
      expect(res.headers['x-robots-tag']).toBe('noindex');
      expect(res.headers['referrer-policy']).toBe('no-referrer');
    }
  });
});
