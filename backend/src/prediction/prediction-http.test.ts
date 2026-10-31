import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PredictionModule } from './prediction.module';
import { AppModule } from '../app.module';

describe('Prediction market has no unverified orders or market data', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const testing = await Test.createTestingModule({ imports: [PredictionModule] }).compile();
    app = testing.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
  });
  afterAll(async () => { await app?.close(); });

  it('is registered in the real backend module', () => {
    const imports: unknown[] = Reflect.getMetadata('imports', AppModule) ?? [];
    expect(imports).toContain(PredictionModule);
  });

  it('rejects unverified market reads with non-cacheable HTTP 503', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/predictions/markets');
    expect(response.status).toBe(503);
    expect(response.body.code).toBe('PREDICTION_MARKET_UNVERIFIED');
    expect(response.body.markets).toBeUndefined();
    expect(response.headers['cache-control']).toContain('no-store');
    expect(response.headers['x-robots-tag']).toContain('noindex');
  });

  it('never acknowledges a buy without a ledger-backed settlement receipt', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/predictions/orders')
      .send({ marketId: 'pred-1', side: 'yes', stakeWld: '10000' });
    expect(response.status).toBe(503);
    expect(response.body.code).toBe('PREDICTION_SETTLEMENT_UNAVAILABLE');
    expect(response.body.success).not.toBe(true);
    expect(response.headers['cache-control']).toContain('no-store');
  });
});
