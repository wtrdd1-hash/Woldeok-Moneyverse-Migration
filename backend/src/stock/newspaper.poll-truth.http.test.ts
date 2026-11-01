import { VersioningType } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { PG_POOL } from '../core/pool.provider';
import { NewspaperController } from './newspaper.controller';

/** No seeded votes, unauthenticated process-memory mutations or invented receipts. */
describe('P1 newspaper poll source-truth HTTP boundary', () => {
  let app: INestApplication;
  const query = vi.fn();

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

  it('GET refuses to report fabricated totals or a verified empty poll', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/newspaper/poll').expect(503);
    expect(res.body).toMatchObject({ statusCode: 503, code: 'NEWSPAPER_POLL_SOURCE_UNVERIFIED' });
    expect(res.body).not.toHaveProperty('data');
    expect(query).not.toHaveBeenCalled();
  });

  it('POST never accepts an unverified vote or returns a success receipt', async () => {
    for (const choiceId of ['bullish', 'unknown']) {
      const res = await request(app.getHttpServer()).post('/api/v1/newspaper/poll/vote')
        .send({ choiceId }).expect(503);
      expect(res.body).toMatchObject({ statusCode: 503, code: 'NEWSPAPER_POLL_VOTE_UNAVAILABLE' });
      expect(res.body).not.toHaveProperty('data');
    }
    expect(query).not.toHaveBeenCalled();
  });

  it('a rejected vote cannot create a later false count', async () => {
    await request(app.getHttpServer()).post('/api/v1/newspaper/poll/vote')
      .send({ choiceId: 'bullish' }).expect(503);
    await request(app.getHttpServer()).get('/api/v1/newspaper/poll').expect(503);
    expect(query).not.toHaveBeenCalled();
  });
});
