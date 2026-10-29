import { ValidationPipe, VersioningType } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from '../app.module';
import { ProblemFilter } from '../core/problem.filter';
import { UNPREFIXED_ROUTES } from '../http/prefix';

const ORIGINAL_ENV = { ...process.env };
const IDENTITY = '7d3bbfa5-4e7d-44d5-93b4-f28f07a93a45';

describe('identity unlink HTTP authorization boundary', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.APP_BASE_URL = 'http://127.0.0.1:3000';
    process.env.INTERNAL_API_TOKEN = 'x'.repeat(32);
    delete process.env.DATABASE_URL;
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true, forbidNonWhitelisted: true, transform: true,
    }));
    app.useGlobalFilters(new ProblemFilter(false));
    app.setGlobalPrefix('api', { exclude: [...UNPREFIXED_ROUTES] });
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    process.env = { ...ORIGINAL_ENV };
  });

  it('mounts the owner identity read without exposing private identities to anonymous callers', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/account/identities');
    expect(response.status).not.toBe(404);
    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.body?.identities).toBeUndefined();
  });

  it('refuses unauthenticated identity unlink and never fabricates a removal receipt', async () => {
    const response = await request(app.getHttpServer())
      .delete(`/api/v1/account/identities/${IDENTITY}`);
    expect(response.status).not.toBe(404);
    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.body?.identityId).toBeUndefined();
  });
});
