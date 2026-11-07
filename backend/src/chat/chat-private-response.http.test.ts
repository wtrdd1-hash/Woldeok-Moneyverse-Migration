import { Controller, Get, Global, Module, UnauthorizedException, VersioningType } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AuthModule } from '../auth/auth.module';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { PG_POOL } from '../core/pool.provider';
import { ChatModule } from './chat.module';
import { ChatService } from './chat.service';

const owner = '11111111-1111-4111-8111-111111111111';
const conversation = '22222222-2222-4222-8222-222222222222';
@Module({}) class TestAuthModule {}
@Global() @Module({ providers: [{ provide: PG_POOL, useValue: null }], exports: [PG_POOL] }) class TestDatabaseModule {}
@Controller('public-probe') class PublicProbeController {
  @Get() get() { return { ok: true }; }
}

describe('member chat private HTTP responses', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const session = {
      canActivate: (context: { switchToHttp: () => { getRequest: () => { headers: Record<string, string>; session?: unknown } } }) => {
        const req = context.switchToHttp().getRequest();
        if (req.headers['x-test-owner'] !== '1') throw new UnauthorizedException('login required');
        req.session = { id: '33333333-3333-4333-8333-333333333333', user_id: owner };
        return true;
      },
    };
    const allow = { canActivate: () => true };
    const service = {
      listConversations: async () => [{ conversationId: conversation }],
      totalUnreadCount: async () => 1,
      listMessages: async () => [{ body: 'message', sequence: '1' }],
      syncMessages: async () => [{ body: 'message', sequence: '1' }],
      openConversation: async () => ({ conversationId: conversation }),
    };
    const moduleRef = await Test.createTestingModule({
      imports: [TestDatabaseModule, ChatModule],
      controllers: [PublicProbeController],
    })
      .overrideModule(AuthModule).useModule(TestAuthModule)
      .overrideProvider(ChatService).useValue(service)
      .overrideGuard(SessionGuard).useValue(session)
      .overrideGuard(AuthenticatedGuard).useValue(allow)
      .overrideGuard(ConsentGuard).useValue(allow)
      .compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    await app.init();
  });
  afterAll(async () => { await app?.close(); });

  it.each([
    '/api/v1/chat/conversations',
    '/api/v1/chat/unread-count',
    `/api/v1/chat/conversations/${conversation}/messages`,
    `/api/v1/chat/conversations/${conversation}/sync`,
  ])('protects successful GET %s', async (path) => {
    const response = await request(app.getHttpServer()).get(path).set('x-test-owner', '1');
    expect(response.status).toBe(200);
    expect(response.headers['cache-control']).toBe('private, no-store');
    expect(response.headers['x-robots-tag']).toBe('noindex');
    expect(response.headers['referrer-policy']).toBe('no-referrer');
  });

  it('protects guard-denied GET', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/chat/conversations');
    expect(response.status).toBe(401);
    expect(response.headers['cache-control']).toBe('private, no-store');
    expect(response.headers['x-robots-tag']).toBe('noindex');
    expect(response.headers['referrer-policy']).toBe('no-referrer');
  });

  it('protects POST and HEAD', async () => {
    const post = await request(app.getHttpServer()).post('/api/v1/chat/conversations')
      .set('x-test-owner', '1').send({ peerUserId: owner });
    const head = await request(app.getHttpServer()).head('/api/v1/chat/conversations').set('x-test-owner', '1');
    expect(post.status).toBe(201);
    expect(head.status).toBe(200);
    for (const response of [post, head]) {
      expect(response.headers['cache-control']).toBe('private, no-store');
      expect(response.headers['x-robots-tag']).toBe('noindex');
      expect(response.headers['referrer-policy']).toBe('no-referrer');
    }
  });

  it('does not alter public endpoints', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/public-probe');
    expect(response.status).toBe(200);
    expect(response.headers['cache-control']).not.toBe('private, no-store');
    expect(response.headers['x-robots-tag']).toBeUndefined();
  });
});
