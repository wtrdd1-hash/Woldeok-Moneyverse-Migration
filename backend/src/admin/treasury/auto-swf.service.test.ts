import { describe, expect, it, vi, beforeEach } from 'vitest';
import { AutoSovereignWealthFundService } from './auto-swf.service';
import type { Pool } from 'pg';
import type { DiscordAlertService } from '../../discord/discord-alert.service';

describe('AutoSovereignWealthFundService', () => {
  let service: AutoSovereignWealthFundService;
  let mockPool: any;
  let mockDiscordAlert: any;

  beforeEach(() => {
    mockDiscordAlert = {
      sendAdminDirectMessage: vi.fn().mockResolvedValue({ success: true }),
      sendDiscordEmbed: vi.fn().mockResolvedValue(true),
    };

    mockPool = {
      query: vi.fn(),
      connect: vi.fn(),
    };

    service = new AutoSovereignWealthFundService(
      mockPool as unknown as Pool,
      mockDiscordAlert as unknown as DiscordAlertService,
    );
  });

  it('preserves 25M floor and executes autonomous compounding growth', async () => {
    const mockClient = {
      query: vi.fn().mockImplementation((queryText: string) => {
        if (queryText.includes('system_treasury_vaults WHERE code = \'VAULT_MAIN\'')) {
          return Promise.resolve({
            rows: [{ id: 'vault-uuid-main', balance_wld: '25000000' }],
          });
        }
        if (queryText.includes('SELECT id, asset_symbol, current_valuation_wld')) {
          return Promise.resolve({
            rows: [
              { id: 'stock-1', asset_symbol: 'WDX-TEC', current_valuation_wld: '20000000', total_invested_wld: '18000000' },
              { id: 'stock-2', asset_symbol: 'WDX-FIN', current_valuation_wld: '15000000', total_invested_wld: '14000000' },
            ],
          });
        }
        if (queryText.includes('SELECT COALESCE(SUM(current_valuation_wld::numeric)')) {
          return Promise.resolve({
            rows: [{ sum: '35000000' }],
          });
        }
        if (queryText.includes('SELECT id FROM public.users')) {
          return Promise.resolve({ rows: [{ id: 'user-1' }] });
        }
        return Promise.resolve({ rows: [] });
      }),
      release: vi.fn(),
    };
    mockPool.connect = vi.fn().mockResolvedValue(mockClient);

    mockPool.query = vi.fn().mockImplementation((queryText: string) => {
      if (queryText.includes('treasury_swf_configs')) {
        return Promise.resolve({
          rows: [
            {
              id: 'current',
              is_enabled: true,
              safe_reserve_wld: '25000000',
              max_single_investment_wld: '10000000',
              equity_ratio_pct: 60,
              bond_ratio_pct: 30,
              dividend_ratio_pct: 10,
              auto_harvest_enabled: true,
              auto_tax_enabled: true,
              auto_growth_yield_bps: 150,
              target_anchor_wld: '25000000',
              rebalance_interval_hours: 1,
              last_executed_at: null,
            },
          ],
        });
      }
      return Promise.resolve({ rows: [] });
    });

    const result = await service.evaluateAndRebalance();
    expect(result.executed).toBe(true);
    expect(BigInt(result.totalAumWld!)).toBeGreaterThan(BigInt(25000000));
    expect(BigInt(result.vaultCashWld!)).toBeGreaterThanOrEqual(BigInt(25000000));
    expect(mockDiscordAlert.sendAdminDirectMessage).toHaveBeenCalled();
  });
});
