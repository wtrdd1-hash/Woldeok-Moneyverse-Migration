import { VersioningType } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from '../app.module';
import { UNPREFIXED_ROUTES } from '../http/prefix';

const originalEnv = { ...process.env };

describe('public lottery HTTP API', () => {
  let app: INestApplication;

  beforeAll(async () => {
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
    await app.close();
    process.env = { ...originalEnv };
  });

  it('mounts the public GET route and fails closed without PostgreSQL', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/lottery/rounds')
      .set('x-internal-token', 'x'.repeat(32));
    expect(response.status).toBe(503);
    expect(response.headers['cache-control']).toContain('no-store');
    expect(response.body).toMatchObject({ code: 'lottery_rounds_unavailable' });
  });

  it('never exposes a ticket-purchase command', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/lottery/rounds')
      .set('x-internal-token', 'x'.repeat(32))
      .send({ count: 1 });
    expect(response.status).toBe(404);
  });
});
