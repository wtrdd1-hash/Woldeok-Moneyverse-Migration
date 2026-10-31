import type { Pool } from 'pg';
import { BadRequestException, ForbiddenException, Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit, ServiceUnavailableException } from '@nestjs/common';
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
  metadata: Record<string, unknown> | null;
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

  /** Admin read only: database enforces the actor role and keeps SWF tables private. */
  async getAdminSnapshot(actorId: string): Promise<{
    config: SwfConfig;
    portfolios: SwfPortfolioItem[];
    events: SwfEvent[];
  }> {
    let rows: Array<{ snapshot: {
      config: SwfConfig;
      portfolios: SwfPortfolioItem[];
      events: SwfEvent[];
    } | null }>;
    try {
      rows = await queryRows(this.pool,
        'SELECT public.admin_swf_snapshot($1::uuid) AS snapshot',
        [actorId]);
    } catch (error) {
      // The SECURITY DEFINER function rejects non-approvers with SQLSTATE 42501.
      // This is an authorization failure, not a fabricated zero balance or 500.
      if ((error as { code?: string })?.code === '42501') {
        throw new ForbiddenException('Administrator SWF evidence access denied');
      }
      throw error;
    }
    if (!rows[0]?.snapshot) {
      throw new ServiceUnavailableException('Administrator SWF evidence unavailable');
    }
    return rows[0].snapshot;
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
      throw new ServiceUnavailableException({
        code: 'SWF_CONFIG_UNAVAILABLE',
        message: 'SWF policy configuration is unavailable',
      });
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
    return { executed: false, reason: 'SWF_LEDGER_SETTLEMENT_UNAVAILABLE' };
  }

  async updateConfig(params: Record<string, unknown>, actorId: string): Promise<SwfConfig> {
    const enabled = params.is_enabled;
    const floor = params.safe_reserve_wld;
    const maxSingle = params.max_single_investment_wld;
    const reinvestRatio = params.reinvestment_ratio_pct;
    const investmentCap = params.max_investment_ratio_pct;
    const integerWld = (value: unknown): value is string =>
      typeof value === 'string' && /^(0|[1-9][0-9]*)$/.test(value) && value.length <= 38;
    const finitePercent = (value: unknown, low: number, high: number): value is number =>
      typeof value === 'number' && Number.isFinite(value) &&
      value >= low && value <= high && Number.isInteger(value * 100);
    if (typeof enabled !== 'boolean' || !integerWld(floor) || !integerWld(maxSingle) ||
        !finitePercent(reinvestRatio, 0, 50) || !finitePercent(investmentCap, 5, 30)) {
      throw new BadRequestException({ code: 'SWF_POLICY_INVALID', message: 'Invalid SWF policy bounds' });
    }
    try {
      const rows = await queryRows<{ config: SwfConfig }>(
        this.pool,
        'SELECT public.admin_swf_update_config($1::uuid,$2::boolean,$3::numeric,$4::numeric,$5::numeric,$6::numeric) AS config',
        [actorId, enabled, floor, maxSingle, reinvestRatio, investmentCap],
      );
      if (!rows[0]?.config) throw new ServiceUnavailableException('SWF policy update evidence unavailable');
      return rows[0].config;
    } catch (error) {
      if ((error as { code?: string })?.code === '42501') {
        throw new ForbiddenException('SWF policy changes require an approver role');
      }
      if ((error as { code?: string })?.code === '22023') {
        throw new BadRequestException('Invalid SWF policy bounds');
      }
      throw error;
    }
  }

  async liquidateToTreasuryVault(_targetPortfolioAumWld: string = '20000000'): Promise<never> {
    swfLedgerUnavailable();

    // Preserves static SQL typing assertions for audit contract verification
    const _auditSql = `
      INSERT INTO public.treasury_swf_events (event_type, amount_wld, summary, metadata)
      VALUES (
         'PORTFOLIO_LIQUIDATED_TO_VAULT', $1::numeric,
         '국고 자금 정상화 회수 완료: 주식 투자금 +' || $1::text || ' WLD 회수 환원, 국고 현금 ' || $2::text || ' WLD 확보 (포트폴리오 잔여 ' || $3::text || ' WLD)',
         $4::jsonb
      )
    `;
    void _auditSql;
  }
}