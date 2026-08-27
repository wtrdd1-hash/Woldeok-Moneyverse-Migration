import { ValidationPipe, VersioningType } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from './app.module';
import { ProblemFilter } from './core/problem.filter';

const ORIGINAL_ENV = { ...process.env };
const ID = '00000000-0000-4000-8000-000000000000';

describe('board, privacy and reconciliation routes', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.APP_BASE_URL = 'http://127.0.0.1:3000';
    process.env.INTERNAL_API_TOKEN = 'x'.repeat(32);
    delete process.env.DATABASE_URL;
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    app.useGlobalFilters(new ProblemFilter(false));
    app.setGlobalPrefix('api', {
      exclude: ['health', 'auth/:provider/authorize', 'auth/:provider/callback'],
    });
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    process.env = { ...ORIGINAL_ENV };
  });

  const ROUTES: readonly (readonly ['get' | 'post' | 'delete', string])[] = [
    ['get', '/api/v1/board/posts'],
    ['post', '/api/v1/board/posts'],
    ['delete', `/api/v1/board/posts/${ID}`],
    ['get', '/api/v1/privacy/requests'],
    ['post', '/api/v1/privacy/requests'],
    ['get', '/api/v1/admin/economy/reconciliations/latest'],
  ];

  it.each(ROUTES)('%s %s is mounted', async (method, path) => {
    const response = await request(app.getHttpServer())[method](path);
    expect(response.status, `${method} ${path} did not route anywhere`).not.toBe(404);
  });

  it.each(ROUTES)('%s %s never answers anonymously', async (method, path) => {
    const response = await request(app.getHttpServer())[method](path);
    expect([401, 403, 428, 503]).toContain(response.status);
  });

  // The reconciliation read is administrator-only, and deliberately has no
  // write counterpart: a separate reconciler produces the snapshots.
  it('exposes no command to trigger a reconciliation', async () => {
    for (const method of ['post', 'put', 'patch', 'delete'] as const) {
      const response = await request(app.getHttpServer())[method](
        '/api/v1/admin/economy/reconciliations/latest',
      );
      expect(response.status, `${method} should not exist`).toBe(404);
    }
  });

  it('no longer serves the original reconciliation path', async () => {
    const response = await request(app.getHttpServer()).get(
      '/api/v1/admin/economy/reconciliation/latest',
    );
    expect(response.status).toBe(404);
  });
});
