import { ValidationPipe, VersioningType } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from '../app.module';
import { ProblemFilter } from '../core/problem.filter';
import { UNPREFIXED_ROUTES } from '../http/prefix';

const originalEnv = { ...process.env };

describe('loan repayment preview HTTP boundary', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.APP_BASE_URL = 'http://127.0.0.1:3000';
    process.env.INTERNAL_API_TOKEN = 'x'.repeat(32);
    delete process.env.DATABASE_URL;
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    app.useGlobalFilters(new ProblemFilter(false));
    app.setGlobalPrefix('api', { exclude: [...UNPREFIXED_ROUTES] });
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    process.env = { ...originalEnv };
  });

  it('mounts GET under the private banking session boundary, never answers an anonymous quote', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/banking/repayment-preview?amount=100');
    expect(response.status).not.toBe(404);
    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  it('never exposes a mutation route for preview', async () => {
    const response = await request(app.getHttpServer()).post('/api/v1/banking/repayment-preview').send({ amount: '100' });
    expect(response.status).toBe(404);
  });
});
