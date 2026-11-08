import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it, vi } from 'vitest';
import type { Pool } from 'pg';
import type { DiscordAlertService } from '../../discord/discord-alert.service';
import { TreasuryBondRepository } from './treasury-bond.repository';
import { TreasuryBondService } from './treasury-bond.service';

describe('uncertified hourly bond coupon and maturity settlement', () => {
  it('executes repository settlement via atomic database procedure', async () => {
    const query = vi.fn().mockResolvedValue({
      rows: [{ result: { ok: true, couponsDistributedWld: '4500', maturitiesRedeemedWld: '0', holdingsProcessed: 3, maturedCount: 0 } }]
    });
    const repository = new TreasuryBondRepository({ query } as unknown as Pool);
    const res = await repository.processHourlyCouponsAndMaturities();
    expect(res.couponsDistributedWld).toBe('4500');
    expect(query).toHaveBeenCalledWith(expect.stringContaining('treasury_bond_distribute_daily_coupons'));
  });

  it('invokes the repository during service settlement', async () => {
    const processHourlyCouponsAndMaturities = vi.fn().mockResolvedValue({
      couponsDistributedWld: '4500', maturitiesRedeemedWld: '0', holdingsProcessed: 3, maturedCount: 0
    });
    const service = new TreasuryBondService(
      { processHourlyCouponsAndMaturities } as unknown as TreasuryBondRepository,
    );
    const res = await service.processHourlyCouponsAndMaturities();
    expect(res.couponsDistributedWld).toBe('4500');
    expect(processHourlyCouponsAndMaturities).toHaveBeenCalled();
  });

  it('does not embed a second unjournaled coupon/maturity payout in the SWF sidecar', () => {
    const source = readFileSync(fileURLToPath(new URL('../treasury/auto-swf.service.ts', import.meta.url)), 'utf8');
    expect(source).not.toMatch(/UPDATE\s+public\.account_balances\s+SET\s+available_amount\s*=\s*available_amount\s*\+\s*(?:coupon|principal)/i);
    expect(source).not.toMatch(/INSERT\s+INTO\s+public\.treasury_bond_coupon_logs/i);
  });
});
