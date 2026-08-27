import { ValidationPipe, VersioningType } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from '../app.module';
import { ProblemFilter } from '../core/problem.filter';
import { UNPREFIXED_ROUTES } from '../http/prefix';

const ORIGINAL_ENV = { ...process.env };

/**
 * Boots the real application graph with no DATABASE_URL, so every service
 * provider resolves to null. That is the configuration the original's route
 * snapshot used: it proves a route is mounted and its guards run, without
 * needing data behind it.
 */
describe('wallet routes', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.APP_BASE_URL = 'http://127.0.0.1:3000';
    process.env.INTERNAL_API_TOKEN = 'x'.repeat(32);
    delete process.env.DATABASE_URL;

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: false },
      }),
    );
    app.useGlobalFilters(new ProblemFilter(false));
    app.setGlobalPrefix('api', { exclude: [...UNPREFIXED_ROUTES] });
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    process.env = { ...ORIGINAL_ENV };
  });

  const ROUTES: readonly (readonly ['get' | 'post', string])[] = [
    ['get', '/api/v1/wallet'],
    ['get', '/api/v1/bank/loans'],
    ['post', '/api/v1/wallet/transfers'],
    ['post', '/api/v1/bank/movements'],
    ['post', '/api/v1/bank/loans'],
    ['post', '/api/v1/bank/loans/00000000-0000-4000-8000-000000000000/repayments'],
    ['post', '/api/v1/rewards/daily/claims'],
    ['post', '/api/v1/rewards/work/claims'],
  ];

  it.each(ROUTES)('%s %s is mounted', async (method, path) => {
    const response = await request(app.getHttpServer())[method](path);
    expect(response.status, `${method} ${path} did not route anywhere`).not.toBe(404);
  });

  it.each(ROUTES)('%s %s answers problem+json', async (method, path) => {
    const response = await request(app.getHttpServer())[method](path);
    expect(response.headers['content-type']).toContain('application/problem+json');
    expect(response.body).toMatchObject({ type: 'about:blank', status: response.status });
  });

  // The session store is null here, so SessionGuard reports the store
  // unavailable before any other guard can speak. That is the honest answer:
  // the request was not rejected, it could not be judged.
  it('reports 503 rather than 401 when the session store is offline', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/wallet');
    expect(response.status).toBe(503);
  });

  it('never reaches a handler without a session', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/wallet/transfers')
      .send({ recipientUserId: '00000000-0000-4000-8000-000000000000', amount: 1 });
    expect([401, 403, 503]).toContain(response.status);
  });

  it('does not mount the original paths that were redesigned away', async () => {
    for (const path of ['/api/v1/bank/deposit', '/api/v1/bank/withdraw', '/api/v1/rewards/daily']) {
      const response = await request(app.getHttpServer()).post(path);
      expect(response.status, `${path} should be gone`).toBe(404);
    }
  });
});
