import { ValidationPipe, VersioningType } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from './app.module';
import { ProblemFilter } from './core/problem.filter';
import { UNPREFIXED_ROUTES } from './http/prefix';

const ORIGINAL_ENV = { ...process.env };
const ID = '00000000-0000-4000-8000-000000000000';

/**
 * Covers the three modules the original served from one route file: stocks,
 * businesses and seasons. Every path there required a session and current
 * consent, and every write additionally required CSRF — unlike the shop,
 * whose catalogue is public. These assert that boundary survived the split
 * into separate controllers.
 */
describe('stock, business and season routes', () => {
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

  const ROUTES: readonly (readonly ['get' | 'post', string])[] = [
    ['get', '/api/v1/stocks'],
    ['get', '/api/v1/stocks/portfolio'],
    ['get', '/api/v1/stocks/history'],
    ['get', '/api/v1/stocks/sparklines'],
    ['get', `/api/v1/stocks/${ID}/prices`],
    ['post', `/api/v1/stocks/${ID}/orders`],
    ['get', '/api/v1/business-types'],
    ['get', '/api/v1/businesses'],
    ['post', `/api/v1/business-types/${ID}/purchases`],
    ['post', `/api/v1/businesses/${ID}/settlements`],
    ['get', '/api/v1/seasons/events'],
    ['get', `/api/v1/seasons/events/${ID}/leaderboard`],
    ['post', `/api/v1/seasons/events/${ID}/consumptions`],
  ];

  it.each(ROUTES)('%s %s is mounted', async (method, path) => {
    const response = await request(app.getHttpServer())[method](path);
    expect(response.status, `${method} ${path} did not route anywhere`).not.toBe(404);
  });

  // Not one of these was public in the original, so with the session store
  // offline every one must report the store unavailable rather than serving
  // anything.
  it.each(ROUTES)('%s %s never answers anonymously', async (method, path) => {
    const response = await request(app.getHttpServer())[method](path);
    expect([401, 403, 428, 503]).toContain(response.status);
  });

  // /api/v1/stocks/portfolio and /:id/prices overlap: 'portfolio' is not a
  // UUID, so the fixed segment must win. Route order is behaviour, and this
  // is the pair most likely to flip.
  it('routes portfolio and history to their own handlers, not to :id/prices', async () => {
    for (const path of [
      '/api/v1/stocks/portfolio',
      '/api/v1/stocks/history',
      '/api/v1/stocks/sparklines',
    ]) {
      const response = await request(app.getHttpServer()).get(path);
      expect(response.status, `${path} fell through to a parameterised route`).not.toBe(400);
    }
  });

  it('no longer serves the original command paths', async () => {
    for (const path of [
      '/api/v1/stocks/trade',
      '/api/v1/businesses/purchase',
      '/api/v1/businesses/mine',
      '/api/v1/seasons/events/consume',
    ]) {
      const response = await request(app.getHttpServer()).post(path);
      expect(response.status, `${path} should be gone`).toBe(404);
    }
  });
});
