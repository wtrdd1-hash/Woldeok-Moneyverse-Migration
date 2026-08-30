import { ValidationPipe, VersioningType } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from '../app.module';
import { ProblemFilter } from '../core/problem.filter';
import { UNPREFIXED_ROUTES } from '../http/prefix';

const ORIGINAL_ENV = { ...process.env };
const KEY = '00000000-0000-4000-8000-000000000001';

/**
 * Built against the real application graph with no DATABASE_URL, so every
 * provider is null and every route can only refuse. What that proves is which
 * refusal each route reaches: a member route must never answer 200 here, and a
 * route that answered 404 would mean the module was never registered.
 */
describe('engagement routes', () => {
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

  it('mounts the engagement summary behind a session', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/engagement');
    expect(response.status).not.toBe(404);
    expect([401, 428, 503]).toContain(response.status);
  });

  // One member's goals, their progress and their notification preference are
  // one member's data. With the store offline this must refuse; a 200 would
  // mean a guard was missing and an anonymous caller had been answered.
  it('never answers the summary with data while the store is offline', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/engagement');
    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  it('mounts recording progress as a write', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/engagement/goals/first_wage/progress')
      .send({ idempotencyKey: KEY, amount: 1 });
    expect(response.status).not.toBe(404);
    expect([400, 401, 403, 409, 428, 503]).toContain(response.status);
  });

  it('mounts taking an NPC order as a write', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/engagement/npcs/market_keeper/orders')
      .send({ idempotencyKey: KEY });
    expect(response.status).not.toBe(404);
    expect([400, 401, 403, 409, 428, 503]).toContain(response.status);
  });

  it('mounts the notification preference as a write', async () => {
    const response = await request(app.getHttpServer())
      .put('/api/v1/engagement/preferences')
      .send({ notificationsEnabled: false });
    expect(response.status).not.toBe(404);
    expect([400, 401, 403, 409, 428, 503]).toContain(response.status);
  });

  // All three writes move a row -- progress, an affinity, a preference -- so
  // all three sit behind CsrfGuard. The guard exits early on safe methods,
  // which is why the summary above is not asked for a token, and why none of
  // these may also be reachable as a GET.
  it('does not serve any of the writes as a read', async () => {
    for (const path of [
      '/api/v1/engagement/goals/first_wage/progress',
      '/api/v1/engagement/npcs/market_keeper/orders',
      '/api/v1/engagement/preferences',
    ]) {
      const response = await request(app.getHttpServer()).get(path);
      expect(response.status, path).toBe(404);
    }
  });

  // The preference is a replacement of one row keyed by the member, so PUT is
  // the only verb it answers. A POST alongside it would be a second way to
  // write the same row.
  it('does not accept the preference as a POST', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/engagement/preferences')
      .send({ notificationsEnabled: false });
    expect(response.status).toBe(404);
  });

  // The summary is a read model. If this ever answered, something other than
  // the two receipt-bearing paths would be writing engagement rows.
  it('does not accept a write on the summary itself', async () => {
    const response = await request(app.getHttpServer()).post('/api/v1/engagement').send({});
    expect(response.status).toBe(404);
  });

  // The goal code is not a UUID and carries no pipe, so a malformed one has
  // to reach the repository and be refused there as a bad field. What must
  // not happen is the router losing it: a 404 here would report a mistyped
  // code as a missing endpoint.
  it('routes a malformed goal code to the handler rather than to a 404', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/engagement/goals/AB/progress')
      .send({ idempotencyKey: KEY });
    expect(response.status).not.toBe(404);
    expect([400, 401, 403, 409, 428, 503]).toContain(response.status);
  });
});
