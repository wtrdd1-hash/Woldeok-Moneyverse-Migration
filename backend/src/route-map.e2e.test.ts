import { ValidationPipe, VersioningType } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ROUTE_MAP } from '@moneyverse/contract';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from './app.module';
import { ProblemFilter } from './core/problem.filter';
import { UNPREFIXED_ROUTES } from './http/prefix';

const ORIGINAL_ENV = { ...process.env };
const SAMPLE_ID = '00000000-0000-4000-8000-000000000000';

type Method = 'get' | 'post' | 'put' | 'patch' | 'delete';

/**
 * The route map claims a replacement for every route the original served.
 * This is what turns that claim into a fact for the API half: each backend
 * replacement is requested against the real application graph and must route
 * somewhere.
 *
 * Rows owned by `frontend` are skipped — Next.js serves those, and they are
 * checked when it exists.
 */
function backendRoutes(): readonly (readonly [Method, string])[] {
  const seen = new Set<string>();
  const routes: (readonly [Method, string])[] = [];
  for (const mapping of ROUTE_MAP) {
    if (mapping.replacement === null) continue;
    if (mapping.module === 'frontend') continue;
    const [rawMethod, rawPath] = mapping.replacement.split(' ');
    if (!rawMethod || !rawPath) continue;
    const path = rawPath.replace(/\{[a-zA-Z]+\}/g, SAMPLE_ID);
    const key = `${rawMethod} ${path}`;
    if (seen.has(key)) continue;
    seen.add(key);
    routes.push([rawMethod.toLowerCase() as Method, path]);
  }
  return routes;
}

describe('every mapped backend route is mounted', () => {
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

  const ROUTES = backendRoutes();

  it('has backend routes to check', () => {
    expect(ROUTES.length).toBeGreaterThan(30);
  });

  it.each(ROUTES)('%s %s', async (method, path) => {
    const response = await request(app.getHttpServer())[method](path);
    expect(
      response.status,
      `${method.toUpperCase()} ${path} is in the route map but nothing serves it`,
    ).not.toBe(404);
  });

  // With no database every service provider is null, so a mounted route can
  // only answer with a refusal or an unavailability — never with data.
  //
  // /health is the deliberate exception: a liveness probe that needed the
  // database would report a healthy process as dead during a database
  // restart, which is the opposite of what an orchestrator should do with it.
  it.each(ROUTES.filter(([, path]) => path !== '/health'))(
    '%s %s serves no data without a database',
    async (method, path) => {
      const response = await request(app.getHttpServer())[method](path);
      expect(response.status).toBeGreaterThanOrEqual(400);
    },
  );

  it('answers the liveness probe without a database', async () => {
    const response = await request(app.getHttpServer()).get('/health');
    expect(response.status).toBe(200);
  });
});
