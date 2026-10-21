import { describe, expect, it, vi } from 'vitest';
import { CentralBankService } from './central-bank.service';
import type { Queryable } from '../../core/db';

describe('Monetary telemetry evidence gate', () => {
  it('does not mark a partial wallet and treasury sum as independently verified', async () => {
    const query = vi.fn()
      .mockResolvedValueOnce({ rows: [{ treasury_wld: '100', user_balances_wld: '200', is_issuance_frozen: false }] })
      .mockResolvedValueOnce({ rows: [{ active_orders: '0', mints: '0', retirements: '0' }] });
    const centralBank = new CentralBankService({ query } as unknown as Queryable);
    const report = await centralBank.getMonetaryTelemetry();
    expect(report.m_total).toBe('300');
    expect(report.verified_invariant).toBe(false);
  });
});
