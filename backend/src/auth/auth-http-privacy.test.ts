import 'reflect-metadata';
import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import type { NextFunction, Request, Response } from 'express';
import { AuthModule } from './auth.module';
import { AuthController } from './auth.controller';
import { AuthBootstrapController } from './bootstrap.controller';
import { LocalAuthController } from './local-auth.controller';

function authBoundary() {
  let handler: ((req: Request, res: Response, next: NextFunction) => void) | undefined;
  let routes: unknown[] = [];
  new AuthModule().configure({
    apply: (middleware: typeof handler) => {
      handler = middleware;
      return { forRoutes: (...controllers: unknown[]) => { routes = controllers; } };
    },
  } as never);
  return { handler, routes };
}

describe('authentication HTTP response privacy boundary', () => {
  it('applies before guards on session, local sign-in and prelogin routes', () => {
    const { handler, routes } = authBoundary();
    expect(handler).toBeTypeOf('function');
    expect(routes).toEqual(expect.arrayContaining([
      AuthController, AuthBootstrapController, LocalAuthController,
    ]));
  });

  it.each([200, 401, 403, 503])('keeps %i auth responses private, unindexed and without referrers', async (status) => {
    const { handler } = authBoundary();
    const app = express();
    app.get('/api/v1/auth/session', handler!, (_req, res) => res.status(status).json({ csrfToken: 'private' }));
    const response = await request(app).get('/api/v1/auth/session');
    expect(response.status).toBe(status);
    expect(response.headers['cache-control']).toBe('private, no-store');
    expect(response.headers['x-robots-tag']).toBe('noindex, nofollow');
    expect(response.headers['referrer-policy']).toBe('no-referrer');
  });
});

// Exercise Nest route matching as well as the middleware itself: controller metadata alone
// does not prove that versioned /api/v1 routes actually receive the response headers.
import { VersioningType } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { afterAll, beforeAll } from 'vitest';
import { AppModule } from '../app.module';
import { UNPREFIXED_ROUTES } from '../http/prefix';

describe('Nest authentication route privacy integration', () => {
  let app: INestApplication;
  const originalEnv = { ...process.env };

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.APP_BASE_URL = 'http://127.0.0.1:3000';
    process.env.INTERNAL_API_TOKEN = 'x'.repeat(32);
    delete process.env.DATABASE_URL;
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api', { exclude: [...UNPREFIXED_ROUTES] });
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
    process.env = { ...originalEnv };
  });

  it.each([
    ['/api/v1/auth/session', 503],
    ['/api/v1/auth/providers', 200],
    ['/api/v1/auth/viewer', 200],
  ] as const)('fences real %s response before guards', async (path, expectedStatus) => {
    const response = await request(app.getHttpServer()).get(path);
    expect(response.status).toBe(expectedStatus);
    expect(response.headers['cache-control']).toBe('private, no-store');
    expect(response.headers['x-robots-tag']).toBe('noindex, nofollow');
    expect(response.headers['referrer-policy']).toBe('no-referrer');
  });
});


describe('production internal-token rejection is private', () => {
  let app: INestApplication;
  const originalEnv = { ...process.env };

  beforeAll(async () => {
    process.env.NODE_ENV = 'production';
    process.env.APP_BASE_URL = 'https://easy-scraping.com';
    process.env.INTERNAL_API_TOKEN = 'x'.repeat(32);
    delete process.env.DATABASE_URL;
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api', { exclude: [...UNPREFIXED_ROUTES] });
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
    process.env = { ...originalEnv };
  });

  it('fences HTTP 401 before internal-token guard rejects the session request', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/auth/session');
    expect(response.status).toBe(401);
    expect(response.headers['cache-control']).toBe('private, no-store');
    expect(response.headers['x-robots-tag']).toBe('noindex, nofollow');
    expect(response.headers['referrer-policy']).toBe('no-referrer');
  });
});
