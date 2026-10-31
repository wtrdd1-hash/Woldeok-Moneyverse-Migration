import { ForbiddenException, MiddlewareConsumer, Module, NestModule, UnauthorizedException, VersioningType } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminSessionGuard } from '../auth/guards/admin-session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { SessionRepository } from '../auth/session.repository';
import { CONFIG } from '../core/config';
import { ActivityController } from './activity.controller';
import { ActivityModule } from './activity.module';
import { ActivityService } from './activity.service';

const actor = '11111111-1111-4111-8111-111111111111';
const mockService = {
  trafficDashboard: async () => ({ views: 3 }),
  getLogs: async () => [{ eventType: 'page_view', userId: actor, ipAddress: '192.0.2.7' }],
  recordEvents: async () => ({ accepted: 0 }),
};

@Module({
  controllers: [ActivityController],
  providers: [
    { provide: ActivityService, useValue: mockService },
    { provide: CONFIG, useValue: { trustProxyForwardedFor: false } },
    { provide: SessionRepository, useValue: null },
  ],
})
class ActivityHttpFixture implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    const activityModule = new ActivityModule() as ActivityModule & Partial<NestModule>;
    activityModule.configure?.(consumer);
  }
}

describe('admin activity private headers on real Nest HTTP responses', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const allow = { canActivate: () => true };
    const session = {
      canActivate: (context: { switchToHttp: () => { getRequest: () => { headers: Record<string, string>; session?: unknown } } }) => {
        const req = context.switchToHttp().getRequest();
        if (req.headers['x-test-auth'] !== '1') throw new UnauthorizedException('login required');
        req.session = { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', user_id: actor };
        return true;
      },
    };
    const admin = {
      canActivate: (context: { switchToHttp: () => { getRequest: () => { headers: Record<string, string> } } }) => {
        if (context.switchToHttp().getRequest().headers['x-test-admin'] !== '1') {
          throw new ForbiddenException('admin required');
        }
        return true;
      },
    };
    const ref = await Test.createTestingModule({ imports: [ActivityHttpFixture] })
      .overrideGuard(SessionGuard).useValue(session)
      .overrideGuard(AuthenticatedGuard).useValue(allow)
      .overrideGuard(ConsentGuard).useValue(allow)
      .overrideGuard(AdminGuard).useValue(admin)
      .overrideGuard(AdminSessionGuard).useValue(allow)
      .compile();
    app = ref.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    await app.init();
  });
  afterAll(async () => { await app?.close(); });

  it.each([
    ['/api/v1/admin/activity/logs', '1', '1', 200],
    ['/api/v1/admin/activity/traffic', '1', '1', 200],
    ['/api/v1/admin/activity/logs', '0', '0', 401],
    ['/api/v1/admin/activity/traffic', '0', '0', 401],
    ['/api/v1/admin/activity/logs', '1', '0', 403],
    ['/api/v1/admin/activity/traffic', '1', '0', 403],
  ] as const)('%s with auth=%s admin=%s returns private headers', async (path, auth, admin, status) => {
    const response = await request(app.getHttpServer())
      .get(path).set('x-test-auth', auth).set('x-test-admin', admin);
    expect(response.status).toBe(status);
    expect(response.headers['cache-control']).toBe('private, no-store');
    expect(response.headers['x-robots-tag']).toBe('noindex');
    expect(response.headers['referrer-policy']).toBe('no-referrer');
  });

  it('protects HEAD and query-string requests without exposing admin activity', async () => {
    const response = await request(app.getHttpServer())
      .head('/api/v1/admin/activity/logs?limit=5')
      .set('x-test-auth', '1').set('x-test-admin', '1');
    expect(response.status).toBe(200);
    expect(response.headers['cache-control']).toBe('private, no-store');
    expect(response.headers['x-robots-tag']).toBe('noindex');
    expect(response.headers['referrer-policy']).toBe('no-referrer');
  });

  it('does not impose admin privacy policy on public telemetry ingestion', async () => {
    const response = await request(app.getHttpServer()).post('/api/v1/activity/events').send({ events: [] });
    expect(response.status).toBe(200);
    expect(response.headers['cache-control']).not.toBe('private, no-store');
    expect(response.headers['x-robots-tag']).toBeUndefined();
  });
});
