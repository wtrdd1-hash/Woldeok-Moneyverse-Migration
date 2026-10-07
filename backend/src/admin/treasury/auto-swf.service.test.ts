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

  it('respects governance max_investment_ratio_pct and halts investment when cap is reached', async () => {
    const mockClient = {
      query: vi.fn().mockImplementation((queryText: string) => {
        if (queryText.includes('system_treasury_vaults WHERE code = \'VAULT_MAIN\'')) {
          return Promise.resolve({
            rows: [{ id: 'vault-uuid-main', balance_wld: '30000000' }], // 3,000만 현금 (바닥 초과)
          });
        }
        if (queryText.includes('SELECT COALESCE(SUM(current_valuation_wld::numeric)')) {
          // 이미 포트폴리오 가치가 2,000만 WLD (총 AUM 5,000만의 40%로, 상한 20% 초과 상태)
          return Promise.resolve({ rows: [{ sum: '20000000' }] });
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
              reinvestment_ratio_pct: 15,
              max_investment_ratio_pct: 20, // 20% 상한
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
    // 상한선 도달로 신규 재투자는 0 WLD로 억제되고 국고에 안전 보존됨
    expect(result.reinvestedWld).toBe('0');
  });

  it('updates governance configuration correctly', async () => {
    mockPool.query = vi.fn().mockResolvedValue({ rows: [] });
    const getConfigSpy = vi.spyOn(service, 'getConfig').mockResolvedValue({
      id: 'current',
      is_enabled: true,
      safe_reserve_wld: '30000000',
      max_single_investment_wld: '5000000',
      reinvestment_ratio_pct: 10,
      max_investment_ratio_pct: 15,
      equity_ratio_pct: 60,
      bond_ratio_pct: 30,
      dividend_ratio_pct: 10,
      auto_harvest_enabled: true,
      auto_tax_enabled: true,
      auto_growth_yield_bps: 150,
      target_anchor_wld: '30000000',
      rebalance_interval_hours: 1,
      last_executed_at: null,
    });

    const updated = await service.updateConfig({
      reinvestment_ratio_pct: 10,
      max_investment_ratio_pct: 15,
      safe_reserve_wld: '30000000',
    });

    expect(updated.reinvestment_ratio_pct).toBe(10);
    expect(updated.max_investment_ratio_pct).toBe(15);
    expect(updated.safe_reserve_wld).toBe('30000000');
    expect(mockPool.query).toHaveBeenCalled();
    getConfigSpy.mockRestore();
  });
});
