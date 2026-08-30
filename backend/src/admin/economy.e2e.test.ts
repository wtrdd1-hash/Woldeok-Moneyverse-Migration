import { ValidationPipe, VersioningType } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from '../app.module';
import { ProblemFilter } from '../core/problem.filter';
import { UNPREFIXED_ROUTES } from '../http/prefix';

const ORIGINAL_ENV = { ...process.env };
const ID = '00000000-0000-4000-8000-000000000000';

/**
 * The economy console's surface, built on the real application graph with no
 * DATABASE_URL. Every provider is null, so a mounted route can only refuse --
 * which is exactly what makes the guard chain observable: nothing here may
 * ever answer a caller who has no session.
 */
describe('admin economy console routes', () => {
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
    ['get', '/api/v1/admin/economy'],
    ['get', '/api/v1/admin/economy/alerts'],
    ['post', `/api/v1/admin/economy/alerts/${ID}/acknowledgements`],
    ['post', '/api/v1/admin/economy/bulk-payouts/previews'],
    ['post', '/api/v1/admin/economy/bulk-payouts'],
    ['get', `/api/v1/admin/economy/bulk-payouts/${ID}/report`],
  ];

  it.each(ROUTES)('%s %s is mounted', async (method, path) => {
    const response = await request(app.getHttpServer())[method](path);
    expect(response.status, `${method} ${path} did not route anywhere`).not.toBe(404);
  });

  // Not one of these is public. With the session store offline every one must
  // report a refusal or an unavailability, and never a body.
  it.each(ROUTES)('%s %s never answers anonymously', async (method, path) => {
    const response = await request(app.getHttpServer())[method](path);
    expect([401, 403, 428, 503]).toContain(response.status);
    expect(response.body).not.toHaveProperty('m2_amount');
  });

  /**
   * `admin/economy/reconciliations` belongs to ReconciliationController in the
   * economy module and was mounted first. A `:id` segment at the top of this
   * controller would have swallowed it, so the collision is asserted rather
   * than assumed.
   */
  it('leaves the reconciliation route to its own controller', async () => {
    const response = await request(app.getHttpServer()).get(
      '/api/v1/admin/economy/reconciliations/latest',
    );
    expect(response.status).not.toBe(404);
    expect([401, 403, 428, 503]).toContain(response.status);
  });

  it('does not read a reconciliation id as a bulk payout id', async () => {
    // If 'reconciliations' were being matched as a payout id, ParseUUIDPipe
    // would be the thing that answered, and it answers 400.
    const response = await request(app.getHttpServer()).get(
      '/api/v1/admin/economy/reconciliations/latest',
    );
    expect(response.status).not.toBe(400);
  });

  it('rejects a malformed alert id before any handler runs', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/admin/economy/alerts/not-a-uuid/acknowledgements')
      .send({ reason: 'acknowledging the spike after reading the ledger' });
    expect([400, 401, 403, 428, 503]).toContain(response.status);
    expect(response.status).not.toBe(404);
  });

  /**
   * Raising an alert is a detector's job, not a console button.
   * `admin_raise_alert` takes no actor and writes no audit row, so an HTTP
   * route onto it would let anybody who reached this controller invent the
   * evidence 17.10 exists to preserve. Its absence is deliberate, and this is
   * what keeps somebody from adding it back by accident.
   */
  it('serves no route that raises an alert', async () => {
    for (const path of ['/api/v1/admin/economy/alerts', '/api/v1/admin/economy/alerts/raise']) {
      const response = await request(app.getHttpServer()).post(path);
      expect(response.status, `${path} must not exist`).toBe(404);
    }
  });

  it('serves no listing of past payouts', async () => {
    // 084 has no function for it. A route with nothing behind it would be a
    // promise the database cannot keep.
    const response = await request(app.getHttpServer()).get('/api/v1/admin/economy/bulk-payouts');
    expect(response.status).toBe(404);
  });
});
