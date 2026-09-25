import { ConflictException, ValidationPipe, VersioningType } from '@nestjs/common';
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

const ROUTES = [
  ['get', '/api/v1/work'],
  ['get', '/api/v1/work/tasks'],
  ['post', `/api/v1/work/tasks/${SAMPLE_ID}/complete`],
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
    if (response.status === 404) {
      throw new Error(`${method} ${path} is not served`);
    }
  });

  it.each(ROUTES)('runs a guard before the handler on %s %s', async (method, path) => {
    const response = await request(app.getHttpServer())[method](path);
    expect([401, 503]).toContain(response.status);
    expect(['internal token required', 'session store unavailable', 'login required']).toContain(response.body.detail);
  });

  it('carries the member guard stack, in order, at class level', () => {
    const guards: unknown = Reflect.getMetadata(GUARDS_METADATA, WorkController);
    expect(guards).toEqual([SessionGuard, AuthenticatedGuard, ConsentGuard, CsrfGuard]);
  });

  it('refuses the legacy direct paid-completion handler before any repository payout can run', () => {
    const controller = new WorkController(null);
    expect(() => controller.completeTask(SAMPLE_ID)).toThrow(ConflictException);
    try {
      controller.completeTask(SAMPLE_ID);
    } catch (error) {
      const response = (error as ConflictException).getResponse() as {
        code?: string;
        message?: string;
      };
      expect(response.code).toBe('work_assignment_required');
      expect(response.message).toContain('Direct paid completion is disabled');
    }
  });

  it.each(['dashboard', 'tasks', 'completeTask', 'receipts', 'assignments', 'assign', 'submit', 'verify'] as const)(
    'leaves the class stack in place on %s',
    (handler) => {
      const own: unknown = Reflect.getMetadata(GUARDS_METADATA, WorkController.prototype[handler]);
      if (own !== undefined) {
        throw new Error(`${handler} overrides the class guard stack`);
      }
    },
  );

  it('does not answer the two per-assignment writes on a safe method', async () => {
    for (const path of [
      `/api/v1/work/assignments/${SAMPLE_ID}/completions`,
      `/api/v1/work/assignments/${SAMPLE_ID}/verify`,
    ]) {
      const response = await request(app.getHttpServer()).get(path);
      if (response.status !== 404) {
        throw new Error(`${path} answers GET with status ${response.status}`);
      }
    }
  });
});
