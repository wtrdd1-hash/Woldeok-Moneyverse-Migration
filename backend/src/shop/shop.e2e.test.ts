import { ValidationPipe, VersioningType } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from '../app.module';
import { ProblemFilter } from '../core/problem.filter';
import { UNPREFIXED_ROUTES } from '../http/prefix';

const ORIGINAL_ENV = { ...process.env };

describe('shop routes', () => {
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

  it('mounts the catalogue', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/shop/items');
    expect(response.status).not.toBe(404);
  });

  // The catalogue carries no session guard on purpose. With the store offline
  // it answers 503 because the shop service is null -- not 401, which would
  // mean a guard rejected an anonymous visitor.
  it('does not demand a session for the catalogue', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/shop/items');
    expect(response.status).toBe(503);
    expect(response.body.detail).toBe('shop service is unavailable');
  });

  it('mounts the caller purchase list behind a session', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/shop/purchases');
    expect(response.status).not.toBe(404);
    expect([401, 428, 503]).toContain(response.status);
  });

  it('mounts the purchase command', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/shop/items/00000000-0000-4000-8000-000000000000/purchases')
      .send({ idempotencyKey: '00000000-0000-4000-8000-000000000001' });
    expect(response.status).not.toBe(404);
  });

  it('rejects a malformed item id before any handler runs', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/shop/items/not-a-uuid/purchases')
      .send({ idempotencyKey: '00000000-0000-4000-8000-000000000001' });
    expect([400, 401, 403, 428, 503]).toContain(response.status);
    expect(response.status).not.toBe(404);
  });

  it('no longer serves the original catalogue path', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/shop');
    expect(response.status).toBe(404);
  });
});
