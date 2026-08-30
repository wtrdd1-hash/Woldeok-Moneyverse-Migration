import { ValidationPipe, VersioningType } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from '../app.module';
import { ProblemFilter } from '../core/problem.filter';
import { UNPREFIXED_ROUTES } from '../http/prefix';

const ORIGINAL_ENV = { ...process.env };
const SOMEBODY = '00000000-0000-4000-8000-000000000000';

/**
 * Built against the real application graph with no DATABASE_URL, so every
 * provider is null and every route can only refuse. What that proves is which
 * refusal each route reaches: a profile route must never answer 200 here, and
 * a route that answered 404 would mean ProfileModule was never registered in
 * app.module.ts.
 */
describe('profile routes', () => {
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

  it('mounts the caller’s own profile behind a session', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/profile');
    expect(response.status).not.toBe(404);
    expect([401, 428, 503]).toContain(response.status);
  });

  it('mounts another member’s profile behind a session', async () => {
    const response = await request(app.getHttpServer()).get(`/api/v1/profile/${SOMEBODY}`);
    expect(response.status).not.toBe(404);
    expect([401, 428, 503]).toContain(response.status);
  });

  /**
   * The whole point of the feature is that one member's settings decide what
   * another member sees. A profile read that answered anybody without a
   * session would have skipped the actor the SQL needs to make that decision,
   * and with the store offline there is nothing it could honestly answer.
   */
  it('never answers a profile read with data while the store is offline', async () => {
    for (const path of ['/api/v1/profile', `/api/v1/profile/${SOMEBODY}`]) {
      const response = await request(app.getHttpServer()).get(path);
      expect(response.status, path).toBeGreaterThanOrEqual(400);
    }
  });

  it('mounts the replacement as a write', async () => {
    const response = await request(app.getHttpServer())
      .put('/api/v1/profile')
      .send({ visibility: 'members' });
    expect(response.status).not.toBe(404);
    expect([401, 403, 428, 503]).toContain(response.status);
  });

  /**
   * One command, one name. A POST alongside the PUT would give the same
   * upsert two routes, two OpenAPI operations and two places for the next
   * person to change.
   */
  it('offers no second way to write a profile', async () => {
    const post = await request(app.getHttpServer())
      .post('/api/v1/profile')
      .send({ visibility: 'members' });
    expect(post.status).toBe(404);

    const patch = await request(app.getHttpServer())
      .patch('/api/v1/profile')
      .send({ visibility: 'members' });
    expect(patch.status).toBe(404);
  });

  /**
   * A profile is not a way to edit somebody else's. Only the caller's own is
   * writable, and the subject of a write is the session rather than a path
   * segment.
   */
  it('does not accept a write against another member’s profile', async () => {
    const response = await request(app.getHttpServer())
      .put(`/api/v1/profile/${SOMEBODY}`)
      .send({ visibility: 'public' });
    expect(response.status).toBe(404);
  });

  it('rejects a malformed member id before any handler runs', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/profile/not-a-uuid');
    expect([400, 401, 403, 428, 503]).toContain(response.status);
    expect(response.status).not.toBe(404);
  });

  /**
   * 080 adds the casino self-limit alongside the profile functions and the
   * casino module already serves it at PUT /api/v1/casino/self-limit. This is
   * the assertion that notices if it is ever copied here and a member's
   * self-exclusion gains a second front door. It says nothing about the
   * casino's own route, which belongs to that module's tests.
   */
  it('does not serve a second casino self-limit', async () => {
    const response = await request(app.getHttpServer())
      .put('/api/v1/profile/self-limit')
      .send({ dailyBetLimit: 0, dailyLossLimit: 0 });
    expect(response.status).toBe(404);
  });

  // The bytes route carries no session guard on purpose: a public profile's
  // picture has to be readable by somebody who is not signed in, and 094
  // decides that from the profile's own visibility. What it must never do is
  // answer differently for a key that does not exist -- that would confirm
  // somebody has a picture they chose not to show.
  it('answers not-found for a profile image nobody is using, without a session', async () => {
    const response = await request(app.getHttpServer()).get(
      '/media/profile/11111111-2222-4333-8444-555555555555.png',
    );
    expect([404, 503]).toContain(response.status);
  });

  it('mounts the member upload and removal as writes', async () => {
    for (const [method, path] of [
      ['post', '/api/v1/profile/image'],
      ['delete', '/api/v1/profile/image'],
    ] as const) {
      const response = await request(app.getHttpServer())[method](path);
      expect(response.status, `${method} ${path}`).not.toBe(404);
      expect([400, 401, 403, 409, 415, 428, 503]).toContain(response.status);
    }
  });
});
