import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it, vi } from 'vitest';
import type { Pool } from 'pg';
import type { DiscordAlertService } from '../../discord/discord-alert.service';
import { TreasuryBondRepository } from './treasury-bond.repository';
import { TreasuryBondService } from './treasury-bond.service';

describe('uncertified hourly bond coupon and maturity settlement', () => {
  it('refuses repository settlement before acquiring a database connection', async () => {
    const connect = vi.fn();
    const query = vi.fn();
    const repository = new TreasuryBondRepository({ connect, query } as unknown as Pool);
    await expect(repository.processHourlyCouponsAndMaturities()).rejects.toMatchObject({ status: 503 });
    expect(connect).not.toHaveBeenCalled();
    expect(query).not.toHaveBeenCalled();
  });

  it('refuses service settlement before invoking the repository or sending a payout alert', async () => {
    const processHourlyCouponsAndMaturities = vi.fn();
    const sendAdminDirectMessage = vi.fn();
    const service = new TreasuryBondService(
      { processHourlyCouponsAndMaturities } as unknown as TreasuryBondRepository,
      { sendAdminDirectMessage } as unknown as DiscordAlertService,
    );
    await expect(service.processHourlyCouponsAndMaturities()).rejects.toMatchObject({ status: 503 });
    expect(processHourlyCouponsAndMaturities).not.toHaveBeenCalled();
    expect(sendAdminDirectMessage).not.toHaveBeenCalled();
  });

  it('does not embed a second unjournaled coupon/maturity payout in the SWF sidecar', () => {
    const source = readFileSync(fileURLToPath(new URL('../treasury/auto-swf.service.ts', import.meta.url)), 'utf8');
    expect(source).not.toMatch(/UPDATE\s+public\.account_balances\s+SET\s+available_amount\s*=\s*available_amount\s*\+\s*(?:coupon|principal)/i);
    expect(source).not.toMatch(/INSERT\s+INTO\s+public\.treasury_bond_coupon_logs/i);
  });
});
