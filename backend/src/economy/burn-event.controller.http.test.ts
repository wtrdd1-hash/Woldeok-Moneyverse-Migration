import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { Test } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PG_POOL } from '../core/pool.provider';
import { BurnEventController } from './burn-event.controller';

const query = vi.fn();

describe('burn draw public statistics HTTP source contract', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const testingModule = await Test.createTestingModule({
      controllers: [BurnEventController],
      providers: [{ provide: PG_POOL, useValue: { query } }],
    }).compile();
    app = testingModule.createNestApplication();
    await app.init();
  });
  afterAll(async () => { await app?.close(); });

  it('answers 503 without leaking SQL permission details or fabricated zero totals', async () => {
    query.mockReset().mockRejectedValue(new Error('42501 permission denied for burn_event_participations'));
    const response = await request(app.getHttpServer()).get('/economy/events/burn-draw/stats').expect(503);
    expect(response.body.message).toBe('소각 드로우 통계를 확인할 수 없습니다.');
    expect(JSON.stringify(response.body)).not.toMatch(/permission denied|totalBurnedWld|recentWinners/);
  });

  it('does not show a successful partial list when the recent query is unavailable', async () => {
    query.mockReset()
      .mockResolvedValueOnce({ rows: [{ total_burned: '10000', total_participants: '1' }] })
      .mockRejectedValueOnce(new Error('recent query unavailable'));
    const response = await request(app.getHttpServer()).get('/economy/events/burn-draw/stats').expect(503);
    expect(response.body).not.toHaveProperty('success', true);
  });

  it('preserves a verified empty event as HTTP 200 with exact string amounts', async () => {
    query.mockReset()
      .mockResolvedValueOnce({ rows: [{ total_burned: '0', total_participants: '0' }] })
      .mockResolvedValueOnce({ rows: [] });
    const response = await request(app.getHttpServer()).get('/economy/events/burn-draw/stats').expect(200);
    expect(response.body).toEqual({ success: true, totalBurnedWld: '0', totalParticipants: 0, recentWinners: [] });
  });
});
