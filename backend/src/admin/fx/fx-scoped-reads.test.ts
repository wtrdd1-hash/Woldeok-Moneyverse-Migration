import { describe, expect, it, vi } from 'vitest';
import { FxRepository } from './fx.repository';

// A SQL double cannot prove PostgreSQL ACLs; the companion DB test runs as moneyverse_app.
describe('FX public source reads use bounded SECURITY DEFINER boundaries', () => {
  const reserve = { id: 'r1', currentRate: 1352.5, updatedAt: '2026-10-31T00:00:00Z' };
  const history = [{ id: 'h1', rate: 1352.5, createdAt: '2026-10-31T00:00:00Z' }];
  const allocations = [{ id: 'a1', allocationWeightPct: 10 }];
  const agreements = [{ id: 's1', totalFacilityUsd: 10 }];

  it.each([
    ['getReserveStatus', 'fx_public_reserve_status', reserve],
    ['getRateHistory', 'fx_public_rate_history', history],
    ['getSdrAllocations', 'fx_public_sdr_allocations', allocations],
    ['getSwapAgreements', 'fx_public_swap_agreements', agreements],
  ] as const)('%s does not query raw FX tables', async (method, functionName, value) => {
    const query = vi.fn().mockResolvedValue({ rows: [{ result: value }] });
    const repo = new FxRepository({ query } as never);
    await expect(repo[method]()).resolves.toEqual(value);
    expect(query).toHaveBeenCalledTimes(1);
    const sql = String(query.mock.calls[0][0]);
    expect(sql).toContain(`public.${functionName}(`);
    expect(sql).not.toMatch(/\bFROM\s+public\.(foreign_exchange_|currency_swap_agreements)/i);
  });

  it('gets the spot rate from the same scoped reserve read, never raw table SELECT', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [{ result: reserve }] });
    const repo = new FxRepository({ query } as never);
    await expect(repo.getLatestRate()).resolves.toBe(1352.5);
    expect(String(query.mock.calls[0][0])).toContain('public.fx_public_reserve_status(');
  });
});
