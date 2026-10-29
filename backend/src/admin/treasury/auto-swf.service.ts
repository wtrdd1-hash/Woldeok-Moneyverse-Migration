import type { Pool } from 'pg';
import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit, ServiceUnavailableException } from '@nestjs/common';
import { PG_POOL } from '../../core/pool.provider';
import { queryRows } from '../../core/db';
import { DiscordAlertService } from '../../discord/discord-alert.service';

/** Block unverified SWF settlements before any database write or success event. */
export function swfLedgerUnavailable(): never {
  throw new ServiceUnavailableException({
    code: 'SWF_LEDGER_SETTLEMENT_UNAVAILABLE',
    message: 'SWF settlement is blocked until canonical ledger evidence is verified.',
  });
}

export interface SwfConfig {
  id: string;
  is_enabled: boolean;
  safe_reserve_wld: string;
  max_single_investment_wld: string;
  reinvestment_ratio_pct: number;
  max_investment_ratio_pct: number;
  equity_ratio_pct: number;
  bond_ratio_pct: number;
  dividend_ratio_pct: number;
  auto_harvest_enabled: boolean;
  auto_tax_enabled: boolean;
  auto_growth_yield_bps: number;
  target_anchor_wld: string;
  rebalance_interval_hours: number;
  last_executed_at: string | null;
}

export interface SwfPortfolioItem {
  id: string;
  asset_type: string;
  asset_symbol: string;
  asset_name: string;
  quantity: string;
  total_invested_wld: string;
  average_price_wld: string;
  current_valuation_wld: string;
  unrealized_pnl_wld: string;
  updated_at: string;
}

export interface SwfEvent {
  id: string;
  event_type: string;
  amount_wld: string;
  summary: string;
  metadata: any;
  created_at: string;
}

@Injectable()
export class AutoSovereignWealthFundService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AutoSovereignWealthFundService.name);
  private timer: NodeJS.Timeout | null = null;

  constructor(
    @Inject(PG_POOL) private readonly pool: Pool,
    private readonly discordAlert: DiscordAlertService,
  ) {}

  onModuleInit() {
    this.logger.log('Autonomous SWF service initialized with canonical PostgreSQL ledger support.');
  }

  onModuleDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  async getConfig(): Promise<SwfConfig> {
    const rows = await queryRows<SwfConfig>(
      this.pool,
      `SELECT id, is_enabled, safe_reserve_wld::text, max_single_investment_wld::text,
              COALESCE(reinvestment_ratio_pct, 15.00)::float as reinvestment_ratio_pct,
              COALESCE(max_investment_ratio_pct, 20.00)::float as max_investment_ratio_pct,
              equity_ratio_pct::float, bond_ratio_pct::float, dividend_ratio_pct::float,
              COALESCE(auto_harvest_enabled, true) as auto_harvest_enabled,
              COALESCE(auto_tax_enabled, true) as auto_tax_enabled,
              COALESCE(auto_growth_yield_bps, 150) as auto_growth_yield_bps,
              COALESCE(target_anchor_wld, 25000000)::text as target_anchor_wld,
              rebalance_interval_hours, last_executed_at
       FROM public.treasury_swf_configs
       WHERE id = 'current'
       LIMIT 1`,
    );
    if (!rows[0]) {
      return {
        id: 'current',
        is_enabled: false,
        safe_reserve_wld: '85000000',
        max_single_investment_wld: '10000000',
        reinvestment_ratio_pct: 15.0,
        max_investment_ratio_pct: 20.0,
        equity_ratio_pct: 60.0,
        bond_ratio_pct: 30.0,
        dividend_ratio_pct: 10.0,
        auto_harvest_enabled: true,
        auto_tax_enabled: true,
        auto_growth_yield_bps: 150,
        target_anchor_wld: '25000000',
        rebalance_interval_hours: 1,
        last_executed_at: null,
      };
    }
    return rows[0];
  }

  async getPortfolios(): Promise<SwfPortfolioItem[]> {
    return queryRows<SwfPortfolioItem>(
      this.pool,
      `SELECT id::text, asset_type, asset_symbol, asset_name, quantity::text,
              total_invested_wld::text, average_price_wld::text,
              current_valuation_wld::text, unrealized_pnl_wld::text, updated_at
       FROM public.treasury_swf_portfolios
       ORDER BY current_valuation_wld DESC`,
    );
  }

  async getRecentEvents(limit = 20): Promise<SwfEvent[]> {
    return queryRows<SwfEvent>(
      this.pool,
      `SELECT id::text, event_type, amount_wld::text, summary, metadata, created_at
       FROM public.treasury_swf_events
       ORDER BY created_at DESC
       LIMIT $1`,
      [limit],
    );
  }

  async evaluateAndRebalance(): Promise<{ executed: boolean; reason: string }> {
    if (process.env.MONEYVERSE_SWF_EXECUTION_ENABLED !== 'true') {
      return { executed: false, reason: 'SWF_RUNTIME_EXECUTION_DISABLED' };
    }
    // A runtime switch cannot certify immutable settlement or authorize mutations.
    return { executed: false, reason: 'SWF_LEDGER_SETTLEMENT_UNAVAILABLE' };
  }

  async updateConfig(params: Partial<SwfConfig>): Promise<SwfConfig> {
    await queryRows(
      this.pool,
      `UPDATE public.treasury_swf_configs
       SET is_enabled = COALESCE($1, is_enabled),
           safe_reserve_wld = COALESCE($2, safe_reserve_wld),
           max_single_investment_wld = COALESCE($3, max_single_investment_wld),
           reinvestment_ratio_pct = COALESCE($4, reinvestment_ratio_pct),
           max_investment_ratio_pct = COALESCE($5, max_investment_ratio_pct),
           updated_at = clock_timestamp()
       WHERE id = 'current'`,
      [
        params.is_enabled,
        params.safe_reserve_wld,
        params.max_single_investment_wld,
        params.reinvestment_ratio_pct,
        params.max_investment_ratio_pct,
      ],
    );

    await queryRows(
      this.pool,
      `INSERT INTO public.treasury_swf_events (event_type, amount_wld, summary, metadata)
       VALUES (
          'GOVERNANCE_CONFIG_UPDATED', 0,
          '관리자가 국고 자금 거버넌스 정책(투자비율 ' || COALESCE($1, 15) || '%, 투자상한 ' || COALESCE($2, 20) || '%, 안전보존금 ' || COALESCE($3, 85000000) || ' WLD)을 변경하였습니다.',
          $4
       )`,
      [
        params.reinvestment_ratio_pct,
        params.max_investment_ratio_pct,
        params.safe_reserve_wld,
        JSON.stringify(params),
      ],
    ).catch(() => {});

    return this.getConfig();
  }

  async liquidateToTreasuryVault(_targetPortfolioAumWld: string = '20000000'): Promise<{ success: boolean; message: string }> {
    return swfLedgerUnavailable();
  }
}
