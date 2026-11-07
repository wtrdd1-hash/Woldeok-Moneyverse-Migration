import 'reflect-metadata';
import { Controller, ForbiddenException, Get, MiddlewareConsumer, Module, NestModule, ServiceUnavailableException, UnauthorizedException, VersioningType } from '@nestjs/common';
import type { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminSessionGuard } from '../auth/guards/admin-session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { SafetyController } from './safety.controller';
import { SafetyModule } from './safety.module';
import { SafetyService } from './safety.service';

const OWNER = '11111111-1111-4111-8111-111111111111';
const report = vi.fn().mockResolvedValue({ id: 'case-123', messages: [{ body: 'private evidence' }] });
const safetyService = {
  submitTakedown: vi.fn().mockResolvedValue({ caseId: 'case-123', status: 'SUBMITTED' }),
  getTakedownStatus: vi.fn().mockResolvedValue({ caseId: 'case-123', status: 'SUBMITTED' }),
  adminListTakedowns: vi.fn().mockResolvedValue({ items: [], count: 0 }),
  adminActionTakedown: vi.fn().mockResolvedValue({ success: true }),
  adminListChatReports: vi.fn().mockResolvedValue({ items: [], count: 0 }),
  adminGetChatReport: report,
  adminActionChatReport: vi.fn().mockResolvedValue({ success: true }),
};

@Controller('unrelated-public-safety-probe')
class PublicProbeController {
  @Get()
  probe() { return { public: true }; }
}

@Module({
  controllers: [SafetyController, PublicProbeController],
  providers: [{ provide: SafetyService, useValue: safetyService }],
})
class SafetyHttpFixture implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    // Use the production module's middleware, not a test-only approximation.
    const configure = (new SafetyModule() as unknown as NestModule).configure;
    if (typeof configure === 'function') configure(consumer);
  }
}

function expectPrivate(headers: Record<string, string | string[] | undefined>): void {
  expect(headers['cache-control']).toBe('private, no-store');
  expect(headers['x-robots-tag']).toBe('noindex');
  expect(headers['referrer-policy']).toBe('no-referrer');
}

function asAdmin(builder: request.Test): request.Test {
  return builder.set('x-test-owner', '1').set('x-test-admin', '1');
}

describe('safety takedown and private chat moderation HTTP privacy', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const session = {
      canActivate: (context: ExecutionContext) => {
        const req = context.switchToHttp().getRequest();
        if (req.headers['x-test-owner'] !== '1') throw new UnauthorizedException('login required');
        req.session = { user_id: OWNER, id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' };
        return true;
      },
    };
    const consent = {
      canActivate: (context: ExecutionContext) => {
        if (context.switchToHttp().getRequest().headers['x-test-consent'] === '0') {
          throw new ForbiddenException('consent required');
        }
        return true;
      },
    };
    const admin = {
      canActivate: (context: ExecutionContext) => {
        if (context.switchToHttp().getRequest().headers['x-test-admin'] !== '1') {
          throw new ForbiddenException('admin required');
        }
        return true;
      },
    };
    const csrf = {
      canActivate: (context: ExecutionContext) => {
        if (context.switchToHttp().getRequest().headers['x-test-csrf'] === '0') {
          throw new ForbiddenException('csrf required');
        }
        return true;
      },
    };
    const ref = await Test.createTestingModule({ imports: [SafetyHttpFixture] })
      .overrideGuard(SessionGuard).useValue(session)
      .overrideGuard(AuthenticatedGuard).useValue({ canActivate: () => true })
      .overrideGuard(ConsentGuard).useValue(consent)
      .overrideGuard(AdminGuard).useValue(admin)
      .overrideGuard(AdminSessionGuard).useValue({ canActivate: () => true })
      .overrideGuard(CsrfGuard).useValue(csrf)
      .compile();
    app = ref.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    await app.init();
  });
  afterAll(async () => { await app?.close(); });

  it.each([
    '/api/v1/admin/safety/takedowns',
    '/api/v1/admin/safety/chat-reports',
    '/api/v1/admin/safety/chat-reports/11111111-1111-4111-8111-111111111111',
  ])('protects unauthenticated and non-admin refusals for %s', async (path) => {
    expectPrivate((await request(app.getHttpServer()).get(path).expect(401)).headers);
    expectPrivate((await request(app.getHttpServer()).get(path).set('x-test-owner', '1').expect(403)).headers);
  });

  it('protects private chat evidence success, consent refusal and upstream failure', async () => {
    const path = '/api/v1/admin/safety/chat-reports/11111111-1111-4111-8111-111111111111';
    const success = await asAdmin(request(app.getHttpServer()).get(path)).expect(200);
    expectPrivate(success.headers);
    expect(success.body.messages[0].body).toBe('private evidence');
    expectPrivate((await asAdmin(request(app.getHttpServer()).get(path)).set('x-test-consent', '0').expect(403)).headers);
    report.mockRejectedValueOnce(new ServiceUnavailableException('evidence unavailable'));
    expectPrivate((await asAdmin(request(app.getHttpServer()).get(path)).expect(503)).headers);
  });

  it('protects admin takedown queues and HEAD responses', async () => {
    expectPrivate((await asAdmin(request(app.getHttpServer()).get('/api/v1/admin/safety/takedowns')).expect(200)).headers);
    const head = await asAdmin(request(app.getHttpServer()).head('/api/v1/admin/safety/chat-reports')).expect(200);
    expectPrivate(head.headers);
    expect(head.text).toBeUndefined();
  });

  it('protects CSRF rejection on sensitive moderation action', async () => {
    const path = '/api/v1/admin/safety/chat-reports/11111111-1111-4111-8111-111111111111/action';
    const response = await asAdmin(request(app.getHttpServer()).post(path)).set('x-test-csrf', '0').send({ action: 'REJECTED' }).expect(403);
    expectPrivate(response.headers);
  });

  it('protects public takedown input errors and successful status lookups', async () => {
    expectPrivate((await request(app.getHttpServer()).post('/api/v1/safety/takedown').send({}).expect(400)).headers);
    const status = await request(app.getHttpServer()).post('/api/v1/safety/takedown/status')
      .send({ caseId: 'case-123', passcode: 'secret123' }).expect(200);
    expectPrivate(status.headers);
    expect(status.body.caseId).toBe('case-123');
  });

  it('does not change unrelated public endpoint cache semantics', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/unrelated-public-safety-probe').expect(200);
    expect(response.headers['cache-control']).not.toBe('private, no-store');
    expect(response.headers['x-robots-tag']).toBeUndefined();
  });
});
