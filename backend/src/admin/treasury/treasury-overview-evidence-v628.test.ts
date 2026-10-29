import { describe, expect, it, vi } from 'vitest';
import type { Queryable } from '../../core/db';
import { TreasuryRepository } from './treasury.repository';

const vault = {
  id: '00000000-0000-4000-8000-000000000001',
  code: 'VAULT_MAIN', name: 'Main', balance_wld: '1000000',
  description: '', created_at: new Date(), updated_at: new Date(),
};

type Failure = 'circulation' | 'missing-circulation' | 'zero-circulation' | 'outflow' | 'missing-outflow' | 'negative-outflow' | 'budgets' | 'none';

function fixture(failure: Failure = 'none', dailyAverage = '1000') {
  const query = vi.fn(async (sql: string) => {
    if (sql.includes('FROM public.system_treasury_vaults')) return { rows: [vault] };
    if (sql.includes('sum(ab.available_amount)')) {
      if (failure === 'circulation') throw new Error('circulation read unavailable');
      return { rows: failure === 'missing-circulation' ? [] : [{ total: failure === 'zero-circulation' ? '0' : '500000' }] };
    }
    if (sql.includes('daily_avg')) {
      if (failure === 'outflow') throw new Error('outflow read unavailable');
      return { rows: failure === 'missing-outflow' ? [] : [{ daily_avg: failure === 'negative-outflow' ? '-1' : dailyAverage }] };
    }
    if (sql.includes('SELECT amount_wld, tx_type, reason')) {
      if (failure === 'budgets') throw new Error('budget ledger unavailable');
      return { rows: [] };
    }
    return { rows: [] };
  });
  return { repository: new TreasuryRepository({ query } as unknown as Queryable), query };
}

describe('P1 treasury overview evidence cannot silently become synthetic numbers', () => {
  it.each(['circulation', 'missing-circulation', 'zero-circulation', 'outflow', 'missing-outflow', 'negative-outflow', 'budgets'] as const)(
    'fails closed when %s evidence is unavailable', async (failure) => {
      const { repository } = fixture(failure);
      await expect(repository.getOverview()).rejects.toMatchObject({ status: 503 });
    },
  );

  it('marks 30-day coverage unavailable when no expenses exist, not a fictitious 10,000 WLD/day', async () => {
    const { repository } = fixture('none', '0');
    const overview = await repository.getOverview();
    expect(overview.coverage_days).toBeUndefined();
    expect(overview.total_circulating_wld).toBe('500000');
    expect(overview.reserve_ratio_pct).toBe(200);
  });

  it('preserves exact verified WLD values when all evidence is available', async () => {
    const { repository } = fixture();
    const overview = await repository.getOverview();
    expect(overview.total_treasury_wld).toBe('1000000');
    expect(overview.total_circulating_wld).toBe('500000');
    expect(overview.coverage_days).toBe(1000);
  });
});

import { Test } from '@nestjs/testing';
import request from 'supertest';
import { PublicTreasuryController } from './treasury.controller';
import { TreasuryService } from './treasury.service';

describe('public treasury HTTP evidence boundary', () => {
  it('returns 503 without a success payload when circulation cannot be verified', async () => {
    const { repository } = fixture('circulation');
    const testingModule = await Test.createTestingModule({
      controllers: [PublicTreasuryController],
      providers: [{ provide: TreasuryService, useValue: new TreasuryService(repository) }],
    }).compile();
    const app = testingModule.createNestApplication();
    try {
      await app.init();
      const response = await request(app.getHttpServer()).get('/treasury/public-overview').expect(503);
      expect(response.body.message).toBe('TREASURY_CIRCULATION_UNVERIFIED');
      expect(response.body).not.toHaveProperty('total_treasury_wld');
      expect(response.body).not.toHaveProperty('success', true);
    } finally {
      await app.close();
    }
  });
});
