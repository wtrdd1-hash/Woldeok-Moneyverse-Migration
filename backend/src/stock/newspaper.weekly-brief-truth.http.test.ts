import { VersioningType } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { PG_POOL } from '../core/pool.provider';
import { NewspaperController } from './newspaper.controller';

describe('public newspaper HTTP evidence contract', () => {
  let app: INestApplication;
  const query = vi.fn(async () => ({ rows: [] }));

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [NewspaperController],
      providers: [{ provide: PG_POOL, useValue: { query } }],
    }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    await app.init();
  });

  afterAll(async () => { await app?.close(); });

  it('returns a typed 503 rather than fabricated weekly economic evidence', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/newspaper/weekly-brief').expect(503);
    expect(response.body).toMatchObject({ statusCode: 503, code: 'NEWSPAPER_WEEKLY_BRIEF_UNVERIFIED' });
    expect(response.body).not.toHaveProperty('data');
    expect(query).not.toHaveBeenCalled();
  });

  it('preserves unrelated public live-event pulse reads', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/newspaper/pulse').expect(200);
    expect(response.body).toMatchObject({ success: true, data: { activeEventsCount: 0, sentimentLabel: 'NEUTRAL' } });
  });
});
