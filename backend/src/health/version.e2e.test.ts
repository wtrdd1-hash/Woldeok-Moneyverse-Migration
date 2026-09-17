import { VersioningType } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { HealthModule } from './health.module';

const ORIGINAL_BUILD_ID = process.env.BUILD_ID;

describe('backend runtime identity', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.BUILD_ID = 'runtime-identity-test-sha';
    const moduleRef = await Test.createTestingModule({ imports: [HealthModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api', { exclude: ['health'] });
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    if (ORIGINAL_BUILD_ID === undefined) delete process.env.BUILD_ID;
    else process.env.BUILD_ID = ORIGINAL_BUILD_ID;
  });

  it('serves the immutable build id at /api/version', async () => {
    const response = await request(app.getHttpServer()).get('/api/version');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ id: 'runtime-identity-test-sha' });
    expect(response.headers['cache-control']).toContain('no-store');
  });

  it('does not insert a URI version segment', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/version');
    expect(response.status).toBe(404);
  });
});
