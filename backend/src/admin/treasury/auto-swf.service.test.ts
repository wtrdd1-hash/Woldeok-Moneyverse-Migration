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

  it('halts rebalance when main vault balance is below safe reserve', async () => {
    // config mock: safe reserve = 50,000,000 WLD
    mockPool.query = vi.fn().mockImplementation((queryText: string) => {
      if (queryText.includes('treasury_swf_configs')) {
        return Promise.resolve({
          rows: [
            {
              id: 'current',
              is_enabled: true,
              safe_reserve_wld: '50000000',
              max_single_investment_wld: '10000000',
              equity_ratio_pct: 50,
              bond_ratio_pct: 30,
              dividend_ratio_pct: 20,
              rebalance_interval_hours: 1,
              last_executed_at: null,
            },
          ],
        });
      }
      if (queryText.includes('treasury_vaults')) {
        return Promise.resolve({
          rows: [{ balance_wld: '30000000' }], // safe reserve 미달
        });
      }
      return Promise.resolve({ rows: [] });
    });

    const result = await service.evaluateAndRebalance();
    expect(result.executed).toBe(false);
    expect(result.reason).toContain('MAIN_VAULT_BELOW_SAFE_RESERVE');
    expect(mockDiscordAlert.sendAdminDirectMessage).not.toHaveBeenCalled();
  });

  it('executes rebalance and dispatches discord DM when surplus exists', async () => {
    const mockClient = {
      query: vi.fn().mockImplementation((queryText: string) => {
        if (queryText.includes('SELECT id FROM public.users')) {
          return Promise.resolve({ rows: [{ id: 'user-1' }, { id: 'user-2' }] });
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
              safe_reserve_wld: '50000000',
              max_single_investment_wld: '10000000',
              equity_ratio_pct: 50,
              bond_ratio_pct: 30,
              dividend_ratio_pct: 20,
              rebalance_interval_hours: 1,
              last_executed_at: null,
            },
          ],
        });
      }
      if (queryText.includes('treasury_vaults')) {
        return Promise.resolve({
          rows: [{ balance_wld: '80000000' }], // surplus = 30,000,000 WLD
        });
      }
      return Promise.resolve({ rows: [] });
    });

    const result = await service.evaluateAndRebalance();
    expect(result.executed).toBe(true);
    expect(result.investedWld).toBe('3000000'); // 30M surplus * 10% = 3M WLD
    expect(result.stockWld).toBe('1500000'); // 50%
    expect(result.bondWld).toBe('900000'); // 30%
    expect(result.dividendWld).toBe('600000'); // 20%
    expect(mockDiscordAlert.sendAdminDirectMessage).toHaveBeenCalled();
  });
});
