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
 * Built against the real application graph with no DATABASE_URL, so every
 * provider is null and every route can only refuse. What that proves is which
 * refusal each route reaches: a member route must never answer 200 here, and a
 * route that answered 404 would mean the module was never registered.
 */
describe('progression routes', () => {
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

  it('mounts the growth stage behind a session', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/progression');
    expect(response.status).not.toBe(404);
    expect([401, 428, 503]).toContain(response.status);
  });

  it('mounts the credit standing behind a session', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/progression/credit');
    expect(response.status).not.toBe(404);
    expect([401, 428, 503]).toContain(response.status);
  });

  it('mounts the early-game unlock ladder behind a session', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/progression/early-game');
    expect(response.status).not.toBe(404);
    expect([401, 428, 503]).toContain(response.status);
  });

  // The ladder is a read model computed from receipts, levels and the account's
  // age. If a write on it ever answered, something other than the work loop and
  // the ledger would be deciding what a member has unlocked.
  it('does not accept a write on the unlock ladder', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/progression/early-game')
      .send({});
    expect(response.status).toBe(404);
  });

  // A member's stage and their loans are one member's data. With the store
  // offline these must refuse; a 200 would mean a guard was missing and an
  // anonymous caller had been answered.
  it('never answers a read with data while the store is offline', async () => {
    for (const path of ['/api/v1/progression', '/api/v1/progression/credit']) {
      const response = await request(app.getHttpServer()).get(path);
      expect(response.status, path).toBeGreaterThanOrEqual(400);
    }
  });

  it('mounts the recompute as a write', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/progression/refreshes')
      .send({});
    expect(response.status).not.toBe(404);
    expect([401, 403, 428, 503]).toContain(response.status);
  });

  // The recompute writes a user_progression row, so it has to sit behind
  // CsrfGuard. The guard exits early on safe methods, which is why the two
  // reads above are not asked for a token -- and why this one must not slip
  // through as a GET.
  it('does not serve the recompute as a read', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/progression/refreshes');
    expect(response.status).toBe(404);
  });

  // The recompute is a sub-resource, not a POST to the collection root. If
  // this ever answered, two paths would be writing the same row.
  it('does not accept a write on the stage itself', async () => {
    const response = await request(app.getHttpServer()).post('/api/v1/progression').send({});
    expect(response.status).toBe(404);
  });

  // Borrowing and repaying stay in the wallet module, where the route map
  // pins them. This is the assertion that notices if they are ever copied
  // here and the ledger gains a second front door.
  it('does not serve a second borrowing path', async () => {
    const borrow = await request(app.getHttpServer())
      .post('/api/v1/progression/credit/loans')
      .send({ principalAmount: 1000, idempotencyKey: '00000000-0000-4000-8000-000000000001' });
    expect(borrow.status).toBe(404);

    const repay = await request(app.getHttpServer())
      .post(
        '/api/v1/progression/credit/loans/00000000-0000-4000-8000-000000000000/repayments',
      )
      .send({ amount: 100, idempotencyKey: '00000000-0000-4000-8000-000000000002' });
    expect(repay.status).toBe(404);
  });

  // The wallet still owns them, and this feature's screen calls these.
  it('leaves the wallet loan routes mounted', async () => {
    const list = await request(app.getHttpServer()).get('/api/v1/bank/loans');
    expect(list.status).not.toBe(404);

    const borrow = await request(app.getHttpServer())
      .post('/api/v1/bank/loans')
      .send({ principalAmount: 1000, idempotencyKey: '00000000-0000-4000-8000-000000000001' });
    expect(borrow.status).not.toBe(404);
  });
});
