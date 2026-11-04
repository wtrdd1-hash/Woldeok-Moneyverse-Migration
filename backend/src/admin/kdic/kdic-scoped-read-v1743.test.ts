import { describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { KdicRepository } from './kdic.repository';
import { KdicService } from './kdic.service';

const sql = readFileSync(resolve(__dirname, '../../../../packages/database/migrations/335-kdic-scoped-read-v1743.sql'), 'utf8');

describe('v1743 Test/Production KDIC read access without broad raw table grants', () => {
  it('creates bounded owner-defined fund and institution readers, scoped admin evidence', () => {
    expect(sql).toMatch(/CREATE OR REPLACE FUNCTION public\.kdic_read_fund_v1743\(/);
    expect(sql).toMatch(/CREATE OR REPLACE FUNCTION public\.kdic_read_institutions_v1743\(/);
    expect(sql).toMatch(/CREATE OR REPLACE FUNCTION public\.kdic_read_recent_premiums_v1743\(/);
    expect(sql).toMatch(/CREATE OR REPLACE FUNCTION public\.kdic_read_recent_payouts_v1743\(/);
    expect(sql).toMatch(/SECURITY DEFINER/g);
    expect(sql).toMatch(/user_roles/);
    expect(sql).toMatch(/users/);
    expect(sql).toMatch(/GRANT EXECUTE ON FUNCTION public\.kdic_read_fund_v1743\(/);
    expect(sql).not.toMatch(/GRANT SELECT ON (?:TABLE )?public\.(?:member_profiles|insured_institutions|deposit_insurance)/i);
    expect(sql).not.toMatch(/GRANT (?:ALL|INSERT|UPDATE|DELETE)/i);
  });
  it('queries safe fund and institution wrapper functions rather than raw tables', async () => {
    const query = vi.fn()
      .mockResolvedValueOnce({ rows: [{ id: 'KDIC_MAIN_FUND' }] })
      .mockResolvedValueOnce({ rows: [] });
    const repo = new KdicRepository({ query } as never);
    await repo.getFundStatus();
    await repo.getInsuredInstitutions();
    expect(query.mock.calls[0][0]).toContain('public.kdic_read_fund_v1743()');
    expect(query.mock.calls[1][0]).toContain('public.kdic_read_institutions_v1743()');
    expect(query.mock.calls[0][0]).not.toMatch(/FROM public\.deposit_insurance_funds\b/i);
    expect(query.mock.calls[1][0]).not.toMatch(/FROM public\.insured_institutions\b/i);
  });
  it('never queries private premium/payout evidence for a public visitor', async () => {
    const repo = {
      getFundStatus: vi.fn().mockResolvedValue({ totalFundWld: 0 }),
      getInsuredInstitutions: vi.fn().mockResolvedValue([]),
      listRecentPremiums: vi.fn().mockResolvedValue([]),
      listRecentPayouts: vi.fn().mockResolvedValue([]),
    };
    const service = new KdicService(repo as never);
    const result = await service.getFundOverview();
    expect(result.recentPremiums).toEqual([]);
    expect(result.recentPayouts).toEqual([]);
    expect(repo.listRecentPremiums).not.toHaveBeenCalled();
    expect(repo.listRecentPayouts).not.toHaveBeenCalled();
    await service.getFundOverview('11ef9cb4-55f6-4a6c-9da3-23e5196dcdd1');
    expect(repo.listRecentPremiums).toHaveBeenCalledWith(10, '11ef9cb4-55f6-4a6c-9da3-23e5196dcdd1');
    expect(repo.listRecentPayouts).toHaveBeenCalledWith(10, '11ef9cb4-55f6-4a6c-9da3-23e5196dcdd1');
  });
});
