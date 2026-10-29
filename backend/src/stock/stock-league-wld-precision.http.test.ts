import { VersioningType } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { OptionalSessionGuard } from '../auth/guards/session.guard';
import { SessionRepository } from '../auth/session.repository';
import { CONFIG } from '../core/config';
import { StockLeagueController } from './stock-league.controller';
import { StockLeagueRepository } from './stock-league.repository';

const query = vi.fn();

describe('stock league WLD precision public HTTP contract', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [StockLeagueController],
      providers: [
        { provide: StockLeagueRepository, useValue: new StockLeagueRepository({ query } as any) },
        { provide: SessionRepository, useValue: { get: vi.fn() } },
        { provide: CONFIG, useValue: { cookieSecure: false } },
      ],
    }).overrideGuard(OptionalSessionGuard).useValue({ canActivate: () => true }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    await app.init();
  });
  afterAll(async () => { await app?.close(); });

  it('returns HTTP 503 and domain code, never rounded entry fees', async () => {
    query.mockResolvedValueOnce({ rows: [{
      id: 'season', season_number: 1, title: 'Season',
      starts_at: '2026-10-29T00:00:00Z', ends_at: '2026-11-29T00:00:00Z',
      entry_fee: '9007199254740993', prize_pool: '100', treasury_subsidy: '100',
      status: 'active', winner_id: null, winner_name: null,
      total_participants: 1, created_at: '2026-10-29T00:00:00Z',
    }] });
    const response = await request(app.getHttpServer()).get('/api/v1/stocks/league/current').expect(503);
    expect(response.body.code).toBe('STOCK_LEAGUE_WLD_PRECISION_UNAVAILABLE');
    expect(response.text).not.toContain('9007199254740992');
  });

  it('returns an empty season truthfully when no season exists', async () => {
    query.mockResolvedValueOnce({ rows: [] });
    const response = await request(app.getHttpServer()).get('/api/v1/stocks/league/current').expect(200);
    expect(response.body).toMatchObject({ success: true, season: null, leaderboard: [] });
  });
});
