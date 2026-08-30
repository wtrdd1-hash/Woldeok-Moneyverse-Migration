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

  // The catalogue of migrations 071-075. Unlike `items` above it carries a
  // session, so with the store offline the refusal must come from a guard and
  // not from the handler: `shop catalogue is unavailable` in `detail` would
  // mean the request reached `ShopController.catalog` with no guard in front
  // of it.
  it('mounts the catalogue behind a session', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/shop/catalog');
    expect(response.status).not.toBe(404);
    expect([401, 428, 503]).toContain(response.status);
    expect(response.body.detail, 'a guard must answer before the handler').not.toBe(
      'shop catalogue is unavailable',
    );
  });

  it('mounts the caller’s held items behind a session', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/shop/holdings');
    expect(response.status).not.toBe(404);
    expect([401, 428, 503]).toContain(response.status);
    expect(response.body.detail, 'a guard must answer before the handler').not.toBe(
      'shop catalogue is unavailable',
    );
  });

  it('mounts the catalogue purchase command behind a session', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/shop/catalog/00000000-0000-4000-8000-000000000000/purchases')
      .send({ idempotencyKey: '00000000-0000-4000-8000-000000000001', quantity: 2 });
    expect(response.status).not.toBe(404);
    expect([401, 403, 428, 503]).toContain(response.status);
    expect(response.body.detail, 'a guard must answer before the handler').not.toBe(
      'shop catalogue is unavailable',
    );
  });

  it('mounts the item consumption command behind a session', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/shop/holdings/00000000-0000-4000-8000-000000000000/consumptions')
      .send({ idempotencyKey: '00000000-0000-4000-8000-000000000001' });
    expect(response.status).not.toBe(404);
    expect([401, 403, 428, 503]).toContain(response.status);
    expect(response.body.detail, 'a guard must answer before the handler').not.toBe(
      'shop catalogue is unavailable',
    );
  });

  it('rejects a malformed catalogue item id before any handler runs', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/shop/catalog/not-a-uuid/purchases')
      .send({ idempotencyKey: '00000000-0000-4000-8000-000000000001' });
    expect([400, 401, 403, 428, 503]).toContain(response.status);
    expect(response.status).not.toBe(404);
  });

  // The 009 shop and the catalogue are two paths that must not shadow each
  // other. The public one reaches its handler and says so; the guarded one is
  // stopped before it, and neither answer may be the other's.
  it('keeps the two shop surfaces apart', async () => {
    const legacy = await request(app.getHttpServer()).get('/api/v1/shop/items');
    const catalogue = await request(app.getHttpServer()).get('/api/v1/shop/catalog');
    expect(legacy.status).toBe(503);
    expect(legacy.body.detail).toBe('shop service is unavailable');
    expect(catalogue.body.detail).not.toBe('shop service is unavailable');
  });
});
