import { Test } from '@nestjs/testing';
import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { PublicTreasuryController } from './treasury.controller';
import { TreasuryService } from './treasury.service';

const certified = {
  total_treasury_wld: '9007199254740993',
  available_wld: '9007199254740993',
  reserve_wld: '0',
  reserve_ratio_pct: 100,
  vaults: [{ code: 'VAULT_MAIN', name: 'Main', balance_wld: '9007199254740993' }],
  reconciliation: {
    status: 'RECONCILED',
    total_vaults_balance_wld: '9007199254740993',
    total_ledger_net_flow_wld: '9007199254740993',
    discrepancy_amount_wld: '0',
    last_reconciled_at: '2026-10-30T20:00:00.000Z',
  },
};

async function fetchPublicOverview(overview: unknown) {
  const getOverview = vi.fn().mockResolvedValue(overview);
  const testingModule = await Test.createTestingModule({
    controllers: [PublicTreasuryController],
    providers: [{ provide: TreasuryService, useValue: { getOverview } }],
  }).compile();
  const app = testingModule.createNestApplication();
  await app.init();
  try {
    const response = await request(app.getHttpServer()).get('/treasury/public-overview');
    return { response, getOverview };
  } finally {
    await app.close();
  }
}

describe('P0 public treasury reconciliation proof boundary', () => {
  it.each([
    ['missing reconciliation', { ...certified, reconciliation: undefined }],
    ['unverified reconciliation', { ...certified, reconciliation: { status: 'UNVERIFIED', total_vaults_balance_wld: certified.total_treasury_wld, total_ledger_net_flow_wld: null, discrepancy_amount_wld: null, last_reconciled_at: null } }],
    ['nonzero discrepancy', { ...certified, reconciliation: { ...certified.reconciliation, status: 'DISCREPANCY', discrepancy_amount_wld: '1' } }],
    ['unmatched ledger total', { ...certified, reconciliation: { ...certified.reconciliation, total_ledger_net_flow_wld: '1' } }],
    ['missing certification time', { ...certified, reconciliation: { ...certified.reconciliation, last_reconciled_at: null } }],
    ['invalid certification time', { ...certified, reconciliation: { ...certified.reconciliation, last_reconciled_at: 'not-a-date' } }],
    ['future certification time', { ...certified, reconciliation: { ...certified.reconciliation, last_reconciled_at: '2099-01-01T00:00:00.000Z' } }],
    ['inconsistent vault sum', { ...certified, vaults: [{ ...certified.vaults[0], balance_wld: '1' }] }],
  ])('returns 503/no-store without WLD disclosure for %s', async (_name, overview) => {
    const { response, getOverview } = await fetchPublicOverview(overview);
    expect(getOverview).toHaveBeenCalledOnce();
    expect(response.status).toBe(503);
    expect(response.headers['cache-control']).toContain('no-store');
    expect(response.body.message).toBe('PUBLIC_TREASURY_RECONCILIATION_PENDING');
    expect(response.body).not.toHaveProperty('success', true);
    expect(response.body).not.toHaveProperty('total_treasury_wld');
    expect(response.body).not.toHaveProperty('vaults');
  });

  it('maps raw PostgreSQL privilege failures to private 503 without SQL details', async () => {
    const error = Object.assign(new Error('permission denied for table system_treasury_vaults'), { code: '42501' });
    const testingModule = await Test.createTestingModule({
      controllers: [PublicTreasuryController],
      providers: [{ provide: TreasuryService, useValue: { getOverview: vi.fn().mockRejectedValue(error) } }],
    }).compile();
    const app = testingModule.createNestApplication();
    await app.init();
    try {
      const response = await request(app.getHttpServer()).get('/treasury/public-overview');
      expect(response.status).toBe(503);
      expect(response.body.message).toBe('PUBLIC_TREASURY_RECONCILIATION_PENDING');
      expect(JSON.stringify(response.body)).not.toContain('system_treasury_vaults');
      expect(response.headers['cache-control']).toContain('no-store');
    } finally { await app.close(); }
  });

  it('returns only public WLD projection for an internally consistent certified snapshot', async () => {
    const { response } = await fetchPublicOverview(certified);
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ success: true, total_treasury_wld: certified.total_treasury_wld });
    expect(response.body).not.toHaveProperty('reconciliation');
  });
});
