import { ValidationPipe, VersioningType } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from '../app.module';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { ProfileRepository } from './profile.repository';
import { ProblemFilter } from '../core/problem.filter';
import { UNPREFIXED_ROUTES } from '../http/prefix';

const ORIGINAL_ENV = { ...process.env };
const OTHER_MEMBER = '00000000-0000-4000-8000-000000000000';

/** Profile email and visibility settings must never inherit public edge caching, even on guard errors. */
describe('member profile HTTP privacy', () => {
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

  it.each([
    ['get', '/api/v1/profile'],
    ['get', '/api/v1/profile/settings'],
    ['get', `/api/v1/profile/${OTHER_MEMBER}`],
    ['put', '/api/v1/profile'],
    ['delete', '/api/v1/profile/image'],
    ['head', '/api/v1/profile'],
  ] as const)('protects %s %s before authentication guards', async (method, path) => {
    const response = await request(app.getHttpServer())[method](path);
    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.headers['cache-control']).toBe('private, no-store');
    expect(response.headers['x-robots-tag']).toBe('noindex');
    expect(response.headers['referrer-policy']).toBe('no-referrer');
  });
});


describe('authenticated profile HTTP privacy', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.APP_BASE_URL = 'http://127.0.0.1:3000';
    process.env.INTERNAL_API_TOKEN = 'x'.repeat(32);
    delete process.env.DATABASE_URL;
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideGuard(SessionGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          context.switchToHttp().getRequest().session = {
            id: OTHER_MEMBER,
            user_id: OTHER_MEMBER,
          };
          return true;
        },
      })
      .overrideGuard(AuthenticatedGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(ConsentGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(CsrfGuard)
      .useValue({ canActivate: () => true })
      .overrideProvider(ProfileRepository)
      .useValue({
        view: async () => ({
          display_name: 'Member', image_url: null, joined_at: new Date('2026-10-01T00:00:00Z'),
          job_type: null, job_level: null, work_completions: '0', visibility: 'private',
          featured_title: null,
        }),
        ownAccountEmail: async () => 'private@example.test',
        settings: async () => ({ visibility: 'private' }),
      })
      .compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api', { exclude: [...UNPREFIXED_ROUTES] });
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    process.env = { ...ORIGINAL_ENV };
  });

  it.each(['/api/v1/profile', '/api/v1/profile/settings'])(
    'protects successful owner-only response %s', async (path) => {
      const response = await request(app.getHttpServer()).get(path);
      expect(response.status).toBe(200);
      expect(response.headers['cache-control']).toBe('private, no-store');
      expect(response.headers['x-robots-tag']).toBe('noindex');
      expect(response.headers['referrer-policy']).toBe('no-referrer');
    },
  );
});
