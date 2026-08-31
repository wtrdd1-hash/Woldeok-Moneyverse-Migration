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
 * The three operations screens, mounted on the real application graph with no
 * DATABASE_URL. Every provider is null, so a mounted route can only refuse --
 * which is what makes the guard chain observable: none of these may ever
 * answer a caller with no session.
 */
describe('admin operations console routes', () => {
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
    app.setGlobalPrefix('api', { exclude: [...UNPREFIXED_ROUTES] });
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    process.env = { ...ORIGINAL_ENV };
  });

  const ROUTES: readonly string[] = [
    '/api/v1/admin/work',
    '/api/v1/admin/bank',
    '/api/v1/admin/discord',
  ];

  it.each(ROUTES)('%s is mounted', async (path) => {
    const response = await request(app.getHttpServer()).get(path);
    expect(response.status, `${path} did not route anywhere`).not.toBe(404);
  });

  it.each(ROUTES)('%s never answers anonymously', async (path) => {
    const response = await request(app.getHttpServer()).get(path);
    expect([401, 403, 428, 503]).toContain(response.status);
    expect(response.body).not.toHaveProperty('catalogue');
    expect(response.body).not.toHaveProperty('loans');
    expect(response.body).not.toHaveProperty('routes');
  });

  /**
   * `/admin/discord-outbox-events` belongs to AdminController and was mounted
   * first. A controller at `admin/discord` must not swallow it, so the
   * neighbour is asserted rather than assumed.
   */
  it('leaves the outbox event list on its own path', async () => {
    const response = await request(app.getHttpServer()).get(
      '/api/v1/admin/discord-outbox-events',
    );
    expect(response.status).not.toBe(404);
    expect([401, 403, 428, 503]).toContain(response.status);
  });
});
