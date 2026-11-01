import { Controller, ForbiddenException, Get, MiddlewareConsumer, Module, NestModule, UnauthorizedException, VersioningType } from '@nestjs/common';
import type { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { WorkController } from './work.controller';
import { WorkModule } from './work.module';
import { WorkRepository } from './work.repository';

const OWNER = '11111111-1111-4111-8111-111111111111';

@Controller('work-public-control')
class PublicControlController {
  @Get()
  read() { return { ok: true }; }
}

@Module({
  controllers: [WorkController, PublicControlController],
  providers: [{
    provide: WorkRepository,
    useValue: {
      dashboard: async () => null,
      jobProfile: async () => ({ active_job: 'farmer' }),
      receipts: async () => [],
      assignments: async () => [],
      switchActiveJob: async () => ({ active_job: 'farmer' }),
    },
  }],
})
class WorkHttpFixture implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    // Run the real module's middleware registration, if present, against this minimal fixture.
    (new WorkModule() as WorkModule & { configure?: (consumer: MiddlewareConsumer) => void })
      .configure?.(consumer);
  }
}

function assertPrivate(response: { headers: Record<string, string | string[] | undefined> }) {
  expect(response.headers['cache-control']).toBe('private, no-store');
  expect(response.headers['x-robots-tag']).toBe('noindex');
  expect(response.headers['referrer-policy']).toBe('no-referrer');
}

describe('member Work API real HTTP response privacy', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const session = {
      canActivate: (context: ExecutionContext) => {
        const req = context.switchToHttp().getRequest();
        if (req.headers['x-test-session'] !== '1') throw new UnauthorizedException('login required');
        req.session = { id: OWNER, user_id: OWNER };
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
    const allow = { canActivate: () => true };
    const moduleRef = await Test.createTestingModule({ imports: [WorkHttpFixture] })
      .overrideGuard(SessionGuard).useValue(session)
      .overrideGuard(AuthenticatedGuard).useValue(allow)
      .overrideGuard(ConsentGuard).useValue(consent)
      .overrideGuard(CsrfGuard).useValue(allow)
      .compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    await app.init();
  });

  afterAll(async () => { await app?.close(); });

  it.each([
    ['/api/v1/work', 200],
    ['/api/v1/work/profile', 200],
    ['/api/v1/work/receipts', 200],
    ['/api/v1/work/assignments', 200],
  ] as const)('protects successful GET %s', async (path, status) => {
    const response = await request(app.getHttpServer()).get(path).set('x-test-session', '1');
    expect(response.status).toBe(status);
    assertPrivate(response);
  });

  it('protects successful Work mutation receipts', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/work/active-job').set('x-test-session', '1')
      .send({ jobType: 'farmer' });
    expect(response.status).toBe(201);
    assertPrivate(response);
  });

  it.each([
    ['GET', '/api/v1/work'],
    ['POST', '/api/v1/work/assignments'],
    ['HEAD', '/api/v1/work/receipts'],
  ] as const)('protects denied %s %s before session guards', async (method, path) => {
    const client = request(app.getHttpServer());
    const response = method === 'POST' ? await client.post(path).send({})
      : method === 'HEAD' ? await client.head(path) : await client.get(path);
    expect(response.status).toBe(401);
    assertPrivate(response);
  });

  it.each(['/api/v1/work/profile', '/api/v1/work/active-job'])(
    'protects denied consent on %s', async (path) => {
      const client = request(app.getHttpServer());
      const response = path.endsWith('active-job')
        ? await client.post(path).set('x-test-session', '1').set('x-test-consent', '0').send({ jobType: 'farmer' })
        : await client.get(path).set('x-test-session', '1').set('x-test-consent', '0');
      expect(response.status).toBe(403);
      assertPrivate(response);
    },
  );

  it('protects the intentionally blocked unledgered qualification purchase', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/work/qualifications/certify')
      .set('x-test-session', '1').send({ jobType: 'farmer' });
    expect(response.status).toBe(503);
    expect(response.body.code).toBe('WORK_QUALIFICATION_LEDGER_UNAVAILABLE');
    assertPrivate(response);
  });

  it('does not mark unrelated public endpoints private', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/work-public-control');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true });
    expect(response.headers['cache-control']).not.toBe('private, no-store');
    expect(response.headers['x-robots-tag']).toBeUndefined();
  });
});
