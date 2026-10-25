import { ValidationPipe, VersioningType } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from '../app.module';
import { ProblemFilter } from '../core/problem.filter';
import { UNPREFIXED_ROUTES } from '../http/prefix';

const ORIGINAL_ENV = {...process.env};

describe('loan deadline HTTP guard and route (no database credentials)', () => {
  let app: INestApplication;
  beforeAll(async () => {
    process.env.APP_BASE_URL = 'http://127.0.0.1:3000';
    process.env.INTERNAL_API_TOKEN = 'x'.repeat(32);
    delete process.env.DATABASE_URL;
    const moduleRef = await Test.createTestingModule({imports: [AppModule]}).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({whitelist: true, forbidNonWhitelisted: true, transform: true}));
    app.useGlobalFilters(new ProblemFilter(false));
    app.setGlobalPrefix('api', {exclude: [...UNPREFIXED_ROUTES]});
    app.enableVersioning({type: VersioningType.URI, defaultVersion: '1'});
    await app.init();
  });
  afterAll(async () => {await app.close(); process.env = {...ORIGINAL_ENV};});
  it('mounts GET endpoint, never leaks a quote without authenticated session', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/banking/loan-deadline');
    expect(response.status).not.toBe(404);
    expect([401, 403, 503]).toContain(response.status);
    expect(response.headers['content-type']).toContain('application/problem+json');
    expect(response.body).toMatchObject({type: 'about:blank', status: response.status});
    expect(JSON.stringify(response.body)).not.toContain('cashBalance');
  });
});
