import { describe, expect, it, vi } from 'vitest';
import type { Pool } from 'pg';
import { DurableCentralBankPolicyService } from './durable-policy.service';

const row = {
  id: '00000000-0000-4000-8000-000000000001',
  adjusted_policy_rate: '0.0375',
  inflation_target: '0.0200',
  taylor_base_rate: '0.0385',
  governor_note: 'Existing test reference',
  last_decision_at: '2026-10-28T00:00:00Z',
  rate_decided_by: null,
  reserve_requirement_ratio: '0.0700',
  reserve_decision_at: '2026-10-28T00:00:00Z',
  reserve_rationale: 'Existing reserve reference',
  reserve_decided_by: null,
};
const actor = '00000000-0000-4000-8000-000000000002';

describe('durable central bank policy', () => {
  it('reads the actual numeric policy row, not hardcoded 3.25/7%', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [{ ...row, adjusted_policy_rate: '0.0425', reserve_requirement_ratio: '0.0850' }] });
    const service = new DurableCentralBankPolicyService({ query } as unknown as Pool);
    expect((await service.getBaseRate()).ratePercent).toBe('4.25');
    expect((await service.getReserveRequirement()).ratioPercent).toBe('8.50');
  });

  it('commits a base rate and audit record in the same transaction', async () => {
    const query = vi.fn().mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [row] })
      .mockResolvedValueOnce({ rows: [{ ...row, adjusted_policy_rate: '0.0450', governor_note: 'Inflation stabilization 2026' }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] });
    const release = vi.fn();
    const pool = { connect: vi.fn().mockResolvedValue({ query, release }) };
    const service = new DurableCentralBankPolicyService(pool as unknown as Pool);
    const result = await service.updateBaseRate({
      baseRatePercent: '4.50',
      rateDecisionRationale: 'Inflation stabilization 2026',
      targetInflationPercent: '2.00',
    }, actor);
    expect(result.ratePercent).toBe('4.50');
    expect(query.mock.calls[0][0]).toBe('BEGIN');
    expect(query.mock.calls[3][0]).toContain('central_bank_policy_decisions');
    expect(query.mock.calls[4][0]).toBe('COMMIT');
    expect(release).toHaveBeenCalledTimes(1);
  });

  it('rolls back both the policy and audit on a recording error', async () => {
    const query = vi.fn().mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [row] })
      .mockResolvedValueOnce({ rows: [{ ...row, reserve_requirement_ratio: '0.0800' }] })
      .mockRejectedValueOnce(new Error('audit unavailable'))
      .mockResolvedValueOnce({ rows: [] });
    const release = vi.fn();
    const service = new DurableCentralBankPolicyService({
      connect: vi.fn().mockResolvedValue({ query, release }),
    } as unknown as Pool);
    await expect(service.updateReserveRequirement({
      reserveRatioPercent: '8.00',
      regulationRationale: 'Preserving market liquidity',
    }, actor)).rejects.toThrow('audit unavailable');
    expect(query.mock.calls[4][0]).toBe('ROLLBACK');
    expect(release).toHaveBeenCalledOnce();
  });

  it('rejects invalid rates before opening any transaction', async () => {
    const connect = vi.fn();
    const service = new DurableCentralBankPolicyService({ connect } as unknown as Pool);
    await expect(service.updateBaseRate({ baseRatePercent: '-1', rateDecisionRationale: 'Bad rate is invalid', targetInflationPercent: '2' }, actor)).rejects.toThrow();
    await expect(service.updateReserveRequirement({ reserveRatioPercent: '90', regulationRationale: 'Bad ratio is invalid' }, actor)).rejects.toThrow();
    expect(connect).not.toHaveBeenCalled();
  });

  it('fails closed if a backend has no Postgres connection', async () => {
    const service = new DurableCentralBankPolicyService(null);
    await expect(service.getBaseRate()).rejects.toThrow('MONETARY_POLICY_DATABASE_UNAVAILABLE');
  });
});
