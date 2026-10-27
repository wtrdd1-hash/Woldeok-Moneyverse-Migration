import { ServiceUnavailableException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import type { Queryable } from '../../core/db';
import { CentralBankService } from './central-bank.service';

const measured = { treasury_wld: '100', user_balances_wld: '200', is_issuance_frozen: false };
const counts = { active_orders: '2', mints: '3', retirements: '4' };

describe('P1 monetary telemetry evidence integrity', () => {
  it('does not invent zero policy orders when the counts query fails', async () => {
    const query = vi.fn().mockResolvedValueOnce({ rows: [measured] })
      .mockRejectedValueOnce(new Error('permission denied for monetary_policy_orders'));
    const service = new CentralBankService({ query } as unknown as Queryable);
    await expect(service.getMonetaryTelemetry()).rejects.toThrow(ServiceUnavailableException);
    expect(query).toHaveBeenCalledTimes(2);
  });

  it('does not invent an unfrozen monetary state when the first query has no evidence', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });
    await expect(new CentralBankService({ query } as unknown as Queryable).getMonetaryTelemetry())
      .rejects.toThrow(ServiceUnavailableException);
    expect(query).toHaveBeenCalledTimes(1);
  });

  it('rejects a missing count snapshot instead of silently reporting zero', async () => {
    const query = vi.fn().mockResolvedValueOnce({ rows: [measured] })
      .mockResolvedValueOnce({ rows: [] });
    await expect(new CentralBankService({ query } as unknown as Queryable).getMonetaryTelemetry())
      .rejects.toThrow(ServiceUnavailableException);
  });

  it('returns actual measured values but never invents bank liquidity or a reconciliation timestamp', async () => {
    const query = vi.fn().mockResolvedValueOnce({ rows: [measured] })
      .mockResolvedValueOnce({ rows: [counts] });
    const result = await new CentralBankService({ query } as unknown as Queryable).getMonetaryTelemetry();
    expect(result).toMatchObject({
      m_total: '300', m_circulating: '200', m_treasury: '100',
      active_policy_orders_count: 2, total_mint_certificates_count: 3,
      total_retirement_certificates_count: 4, is_issuance_frozen: false,
      verified_invariant: false, m_bank_liquidity: null, m_locked: null,
      last_reconciled_at: null,
    });
  });
});
