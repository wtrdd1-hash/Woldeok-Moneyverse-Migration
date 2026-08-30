import { ValidationPipe, VersioningType } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from '../app.module';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { ProblemFilter } from '../core/problem.filter';
import { UNPREFIXED_ROUTES } from '../http/prefix';
import { CasinoController } from './casino.controller';
import { CasinoRepository } from './casino.repository';

const ORIGINAL_ENV = { ...process.env };
const KEY = '00000000-0000-4000-8000-000000000001';

/** Every route this module serves, and the method each one answers on. */
const ROUTES = [
  ['get', '/api/v1/casino/coin/terms'],
  ['get', '/api/v1/casino/coin/fairness'],
  ['post', '/api/v1/casino/coin/plays'],
  ['put', '/api/v1/casino/self-limit'],
] as const;

describe('casino routes', () => {
  let app: INestApplication;
  let moduleRef: TestingModule;

  beforeAll(async () => {
    process.env.APP_BASE_URL = 'http://127.0.0.1:3000';
    process.env.INTERNAL_API_TOKEN = 'x'.repeat(32);
    delete process.env.DATABASE_URL;
    moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
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

  it.each(ROUTES)('mounts %s %s', async (method, path) => {
    const response = await request(app.getHttpServer())[method](path);
    expect(response.status, `${method} ${path} is not served`).not.toBe(404);
  });

  /**
   * The strongest statement this file can make about the guards without a
   * database, and it is a real one.
   *
   * With no DATABASE_URL every provider in the graph is null, including the
   * session repository. SessionGuard answers that with its own 503 -- "session
   * store unavailable" -- while the casino handler's 503 says "casino is
   * unavailable". Reading the first means a guard ran and the handler did not,
   * on every route including the two reads. A route that had lost its guards
   * would answer with the second sentence and pass a status-only assertion.
   */
  it.each(ROUTES)('runs a guard before the handler on %s %s', async (method, path) => {
    const response = await request(app.getHttpServer())[method](path);
    expect(response.status).toBe(503);
    expect(response.body.detail, `${method} ${path} reached its handler`).toBe(
      'session store unavailable',
    );
  });

  /**
   * And the stack itself, read off the controller. The order is semantic --
   * SessionGuard resolves the session everything after it reads, and CsrfGuard
   * cannot verify a token without a session id -- so this asserts the sequence
   * and not merely the membership.
   *
   * `GUARDS_METADATA` is the key `@UseGuards` writes; taking it from Nest's own
   * constants rather than spelling '__guards__' here means an upgrade that
   * renames it breaks this import loudly, instead of leaving the assertion
   * reading a key nothing writes and passing on an empty stack.
   */
  it('carries the member guard stack, in order, at class level', () => {
    const guards: unknown = Reflect.getMetadata(GUARDS_METADATA, CasinoController);
    expect(guards).toEqual([SessionGuard, AuthenticatedGuard, ConsentGuard, CsrfGuard]);
  });

  /**
   * CsrfGuard exits early on GET, HEAD and OPTIONS, which is what makes one
   * class-level stack safe for reads and writes together. That only holds
   * while no handler overrides it: a method-level @UseGuards replaces the
   * class stack for that route rather than adding to it, so a route that grew
   * one would silently lose the session guards above.
   */
  it.each(['terms', 'fairness', 'play', 'setSelfLimit'] as const)(
    'leaves the class stack in place on %s',
    (handler) => {
      const own: unknown = Reflect.getMetadata(
        GUARDS_METADATA,
        CasinoController.prototype[handler],
      );
      expect(own, `${handler} overrides the class guard stack`).toBeUndefined();
    },
  );

  /**
   * Both writes are unsafe methods, so CsrfGuard actually runs on them. A
   * write that had been mounted as a GET would sail past it, and the same
   * request would then be forgeable from another origin.
   */
  it('does not answer the two writes on a safe method', async () => {
    for (const path of ['/api/v1/casino/coin/plays', '/api/v1/casino/self-limit']) {
      const response = await request(app.getHttpServer()).get(path);
      expect(response.status, `${path} answers GET`).toBe(404);
    }
  });

  it('rejects a malformed play body no later than the guards do', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/casino/coin/plays')
      .send({ idempotencyKey: KEY, choice: 'edge', stake: 100 });
    expect([400, 401, 403, 428, 503]).toContain(response.status);
    expect(response.status).not.toBe(404);
  });

  it('rejects a stake sent as a string, because implicit conversion is off', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/casino/coin/plays')
      .send({ idempotencyKey: KEY, choice: 'heads', stake: '100' });
    expect([400, 401, 403, 428, 503]).toContain(response.status);
    expect(response.status).not.toBe(404);
  });

  // The repository is a factory that yields null with no pool, not a class
  // provider. Listing the class bare would throw at bootstrap and take the
  // whole API down rather than only these four routes, so this asserts the
  // shape the factory produces instead of trusting the module file.
  it('yields a null repository with no DATABASE_URL', () => {
    expect(moduleRef.get(CasinoRepository, { strict: false })).toBeNull();
  });

  it('serves nothing at the bare casino path', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/casino');
    expect(response.status).toBe(404);
  });
});
