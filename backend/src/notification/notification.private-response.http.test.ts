import { MiddlewareConsumer, Module, NestModule, UnauthorizedException, VersioningType } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { NotificationController } from './notification.controller';
import { NotificationModule } from './notification.module';
import { NotificationService } from './notification.service';

@Module({
  controllers: [NotificationController],
  providers: [{ provide: NotificationService, useValue: { unreadCount: async () => 7 } }],
})
class NotificationHttpFixture implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    new NotificationModule().configure(consumer);
  }
}

describe('notification private headers on real Nest HTTP responses', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const allow = { canActivate: () => true };
    const session = {
      canActivate: (context: { switchToHttp: () => { getRequest: () => { headers: Record<string, string>; session?: unknown } } }) => {
        const req = context.switchToHttp().getRequest();
        if (req.headers['x-test-owner'] !== '1') throw new UnauthorizedException('login required');
        req.session = { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', user_id: '11111111-1111-4111-8111-111111111111' };
        return true;
      },
    };
    const ref = await Test.createTestingModule({ imports: [NotificationHttpFixture] })
      .overrideGuard(SessionGuard).useValue(session)
      .overrideGuard(AuthenticatedGuard).useValue(allow)
      .overrideGuard(ConsentGuard).useValue(allow)
      .overrideGuard(CsrfGuard).useValue(allow)
      .compile();
    app = ref.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    await app.init();
  });
  afterAll(async () => { await app?.close(); });

  it.each([
    ['authorized', '1', 200],
    ['unauthenticated', '0', 401],
  ] as const)('%s unread-count response is never public-cacheable', async (_label, owner, status) => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/notifications/unread-count')
      .set('x-test-owner', owner);
    expect(response.status).toBe(status);
    expect(response.headers['cache-control']).toBe('private, no-store');
    expect(response.headers['x-robots-tag']).toBe('noindex');
    expect(response.headers['referrer-policy']).toBe('no-referrer');
    if (status === 200) expect(response.body).toEqual({ unreadCount: 7 });
  });
});
