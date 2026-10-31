import { Test } from '@nestjs/testing';
import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { ServiceUnavailableException } from '@nestjs/common';
import { PublicTreasuryController } from './treasury.controller';
import { TreasuryService } from './treasury.service';

const overview = {
  total_treasury_wld: '9007199254740993',
  available_wld: '9007199254740993',
  reserve_wld: '0',
  reserve_ratio_pct: 100,
  vaults: [{ code: 'VAULT_MAIN', name: 'Main', balance_wld: '9007199254740993', secret: 'never public' }],
  internal_reconciliation: 'never public',
  reconciliation: { status: 'RECONCILED', total_vaults_balance_wld: '9007199254740993', total_ledger_net_flow_wld: '9007199254740993', discrepancy_amount_wld: '0', last_reconciled_at: '2026-10-30T20:00:00.000Z' },
};

async function appFor(service: { getOverview: () => Promise<unknown> }) {
  const testingModule = await Test.createTestingModule({
    controllers: [PublicTreasuryController],
    providers: [{ provide: TreasuryService, useValue: service }],
  }).compile();
  const app = testingModule.createNestApplication();
  await app.init();
  return app;
}

describe('P1 public treasury route restored after integrated controller loss', () => {
  it('exposes only verified public fields, preserving exact integer WLD strings', async () => {
    const service = { getOverview: vi.fn().mockResolvedValue(overview) };
    const app = await appFor(service);
    try {
      const response = await request(app.getHttpServer()).get('/treasury/public-overview').expect(200);
      expect(service.getOverview).toHaveBeenCalledOnce();
      expect(response.headers['cache-control']).toBe('no-store');
      expect(response.body).toMatchObject({ success: true, total_treasury_wld: overview.total_treasury_wld });
      expect(response.body.vaults).toEqual([{ code: 'VAULT_MAIN', name: 'Main', balance_wld: overview.total_treasury_wld }]);
      expect(response.body).not.toHaveProperty('internal_reconciliation');
      expect(response.body).not.toHaveProperty('reconciliation');
      expect(response.body.timestamp).toBe(overview.reconciliation.last_reconciled_at);
    } finally { await app.close(); }
  });

  it('fails closed without a synthetic financial success response', async () => {
    const app = await appFor({ getOverview: vi.fn().mockRejectedValue(new ServiceUnavailableException('TREASURY_CIRCULATION_UNVERIFIED')) });
    try {
      const response = await request(app.getHttpServer()).get('/treasury/public-overview').expect(503);
      expect(response.body).not.toHaveProperty('success', true);
      expect(response.body).not.toHaveProperty('total_treasury_wld');
    } finally { await app.close(); }
  });
});
