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
import { WorkController } from './work.controller';

const ORIGINAL_ENV = { ...process.env };
const SAMPLE_ID = '00000000-0000-4000-8000-000000000001';

/**
 * Every route this module serves.
 *
 * `tasks` and `receipts` are the two 095 adds, and they are the reason the
 * rest of this module was unreachable: without a way to read the catalogue, a
 * member had no task id to send to `POST /assignments`, so the four routes
 * below it could not be entered from a browser at all.
 */
const ROUTES = [
  ['get', '/api/v1/work'],
  ['get', '/api/v1/work/tasks'],
  ['get', '/api/v1/work/receipts'],
  ['get', '/api/v1/work/assignments'],
  ['post', '/api/v1/work/assignments'],
  ['post', `/api/v1/work/assignments/${SAMPLE_ID}/completions`],
  ['post', `/api/v1/work/assignments/${SAMPLE_ID}/verify`],
] as const;

describe('work routes', () => {
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
   * With no DATABASE_URL every provider in the graph is null, including the
   * session repository. SessionGuard answers that with its own 503 -- "session
   * store unavailable" -- while the work handlers' 503 says "work is
   * unavailable". Reading the first means a guard ran and the handler did not.
   * A route that had lost its guards would answer with the second sentence and
   * still pass a status-only assertion.
   */
  it.each(ROUTES)('runs a guard before the handler on %s %s', async (method, path) => {
    const response = await request(app.getHttpServer())[method](path);
    expect(response.status).toBe(503);
    expect(response.body.detail, `${method} ${path} reached its handler`).toBe(
      'session store unavailable',
    );
  });

  it('carries the member guard stack, in order, at class level', () => {
    const guards: unknown = Reflect.getMetadata(GUARDS_METADATA, WorkController);
    expect(guards).toEqual([SessionGuard, AuthenticatedGuard, ConsentGuard, CsrfGuard]);
  });

  /**
   * CsrfGuard exits early on GET, HEAD and OPTIONS, which is what makes one
   * class-level stack safe for reads and writes together. A method-level
   * @UseGuards replaces the class stack rather than adding to it, so a route
   * that grew one would silently lose the session guards above.
   */
  it.each(['dashboard', 'tasks', 'receipts', 'assignments', 'assign', 'submit', 'verify'] as const)(
    'leaves the class stack in place on %s',
    (handler) => {
      const own: unknown = Reflect.getMetadata(GUARDS_METADATA, WorkController.prototype[handler]);
      expect(own, `${handler} overrides the class guard stack`).toBeUndefined();
    },
  );

  /**
   * The three writes are unsafe methods, so CsrfGuard actually runs on them.
   * A write mounted as a GET would sail past it and be forgeable from another
   * origin -- and `POST /work/assignments` shares its path with a read, which
   * is exactly the shape that makes the mistake easy to miss.
   */
  it('does not answer the two per-assignment writes on a safe method', async () => {
    for (const path of [
      `/api/v1/work/assignments/${SAMPLE_ID}/completions`,
      `/api/v1/work/assignments/${SAMPLE_ID}/verify`,
    ]) {
      const response = await request(app.getHttpServer()).get(path);
      expect(response.status, `${path} answers GET`).toBe(404);
    }
  });
});
