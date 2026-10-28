import type { Pool } from 'pg';
import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import type { Queryable } from '../../core/db';
import { PG_POOL } from '../../core/pool.provider';
import { queryRows } from '../../core/db';
import { DiscordAlertService } from '../../discord/discord-alert.service';

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

  private isRuntimeExecutionEnabled(): boolean {
    return process.env.MONEYVERSE_SWF_EXECUTION_ENABLED === 'true';
  }

  private isRuntimeSchedulerEnabled(): boolean {
    return process.env.MONEYVERSE_SWF_SCHEDULER_ENABLED === 'true';
  }

  onModuleInit() {
    // Flags cannot certify a synthetic tax/harvest cycle as an authoritative ledger settlement.
    // Never arm the scheduler until a DB-owned atomic, idempotent settlement is approved.
    if (this.isRuntimeSchedulerEnabled() || this.isRuntimeExecutionEnabled()) {
      this.logger.warn('Autonomous SWF scheduler is held: SWF_LEDGER_SETTLEMENT_UNAVAILABLE');
    }
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
      // Missing runtime policy must never silently enable autonomous economy mutation.
      return {
        id: 'current',
        is_enabled: false,
        safe_reserve_wld: '25000000',
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

  /** Autonomous SWF writes cannot be enabled by runtime flags without a canonical ledger receipt. */
  async evaluateAndRebalance(): Promise<{ executed: false; reason: string }> {
    if (!this.isRuntimeExecutionEnabled()) {
      return { executed: false, reason: 'SWF_RUNTIME_EXECUTION_DISABLED' };
    }
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

    // 변경 감사 이벤트 등록
    await queryRows(
      this.pool,
      `INSERT INTO public.treasury_swf_events (event_type, amount_wld, summary, metadata)
       VALUES (
          'GOVERNANCE_CONFIG_UPDATED', 0,
          '관리자가 국고 자금 거버넌스 정책(투자비율 ' || COALESCE($1, 15) || '%, 투자상한 ' || COALESCE($2, 20) || '%, 안전보존금 ' || COALESCE($3, 25000000) || ' WLD)을 변경하였습니다.',
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

  /**
   * 과도하게 묶인 주식 포트폴리오 자금을 목표 규모(기본 20,000,000 WLD, 약 15~20%)로 즉시 매도 회수하여
   * 중앙 국고 금고(VAULT_MAIN) 현금으로 전액 환원 입금합니다.
   */
  async liquidateToTreasuryVault(targetPortfolioAumWld: string = '20000000'): Promise<{
    success: boolean;
    liquidatedWld: string;
    vaultCashAfter: string;
    portfolioAfter: string;
    totalAum: string;
  }> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // 1. 메인 국고 금고(VAULT_MAIN) 조회
      const vaultRes = await client.query<{ id: string; balance_wld: string }>(
        `SELECT id, balance_wld::text FROM public.system_treasury_vaults WHERE code = 'VAULT_MAIN' FOR UPDATE`,
      );
      if (!vaultRes.rows[0]) {
        await client.query('ROLLBACK');
        throw new Error('VAULT_MAIN_NOT_FOUND');
      }

      const vaultId = vaultRes.rows[0].id;
      let currentCash = BigInt(vaultRes.rows[0].balance_wld);

      // 2. 현재 포트폴리오 평가액 조회
      const portfolioRows = await client.query<{
        id: string;
        asset_symbol: string;
        current_valuation_wld: string;
        total_invested_wld: string;
      }>(
        `SELECT id, asset_symbol, current_valuation_wld::text, total_invested_wld::text
         FROM public.treasury_swf_portfolios
         FOR UPDATE`,
      );

      let currentPortfolioTotal = BigInt(0);
      for (const row of portfolioRows.rows) {
        currentPortfolioTotal += BigInt(row.current_valuation_wld);
      }

      const targetTotal = BigInt(targetPortfolioAumWld);
      if (currentPortfolioTotal <= targetTotal) {
        await client.query('ROLLBACK');
        return {
          success: true,
          liquidatedWld: '0',
          vaultCashAfter: currentCash.toString(),
          portfolioAfter: currentPortfolioTotal.toString(),
          totalAum: (currentCash + currentPortfolioTotal).toString(),
        };
      }

      const totalToLiquidate = currentPortfolioTotal - targetTotal;
      let remainingLiquidate = totalToLiquidate;

      // 3. 각 종목별 비율에 따라 회수 차감
      for (let i = 0; i < portfolioRows.rows.length; i++) {
        const row = portfolioRows.rows[i];
        if (!row) continue;
        const rowVal = BigInt(row.current_valuation_wld);
        let shareToLiquidate = (rowVal * totalToLiquidate) / currentPortfolioTotal;
        if (i === portfolioRows.rows.length - 1) {
          shareToLiquidate = remainingLiquidate;
        } else {
          remainingLiquidate -= shareToLiquidate;
        }

        const newVal = rowVal > shareToLiquidate ? rowVal - shareToLiquidate : BigInt(0);
        const rowInvested = BigInt(row.total_invested_wld);
        const newInvested = rowInvested > shareToLiquidate ? rowInvested - shareToLiquidate : BigInt(0);

        await client.query(
          `UPDATE public.treasury_swf_portfolios
           SET current_valuation_wld = $1, total_invested_wld = $2, updated_at = clock_timestamp()
           WHERE id = $3`,
          [newVal.toString(), newInvested.toString(), row.id],
        );
      }

      // 4. 중앙 국고 금고(VAULT_MAIN)로 회수 자금 전액 입금
      const cashBefore = currentCash;
      currentCash += totalToLiquidate;

      await client.query(
        `UPDATE public.system_treasury_vaults
         SET balance_wld = (balance_wld::numeric + $1)::text, updated_at = clock_timestamp()
         WHERE id = $2`,
        [totalToLiquidate.toString(), vaultId],
      );

      await client.query(
        `INSERT INTO public.system_treasury_ledger (
            vault_id, tx_type, amount_wld, reason, balance_before, balance_after, created_at
         ) VALUES (
            $1, 'ABSORPTION_SINK', $2,
            '국고 자금 정상화: 과도하게 투자된 주식 자금을 매도 회수하여 중앙 국고 금고로 전액 환원 (현금 85% : 투자 15% 목표)',
            $3, $4, clock_timestamp()
         )`,
        [
          vaultId,
          totalToLiquidate.toString(),
          cashBefore.toString(),
          currentCash.toString(),
        ],
      );

      // 5. 감사 이벤트 기록
      const finalPortfolio = targetTotal;
      const finalTotalAum = currentCash + finalPortfolio;

      await client.query(
        `INSERT INTO public.treasury_swf_events (event_type, amount_wld, summary, metadata)
         VALUES (
            'PORTFOLIO_LIQUIDATED_TO_VAULT', $1,
            '국고 자금 정상화 회수 완료: 주식 투자금 +' || $1 || ' WLD 회수 환원, 국고 현금 ' || $2 || ' WLD 확보 (포트폴리오 잔여 ' || $3 || ' WLD)',
            $4
         )`,
        [
          totalToLiquidate.toString(),
          currentCash.toString(),
          finalPortfolio.toString(),
          JSON.stringify({
            liquidated_wld: totalToLiquidate.toString(),
            vault_cash_after: currentCash.toString(),
            portfolio_after: finalPortfolio.toString(),
            total_aum: finalTotalAum.toString(),
            timestamp: new Date().toISOString(),
          }),
        ],
      );

      await client.query('COMMIT');

      // 6. 디스코드 알림 발송
      const embed = {
        title: '🏦 [국고 자금 정상화] 주식 투자금 국고 현금 환원 집행 완료',
        description: `국가 시스템(비상/인프라/지준금) 자금 확보를 위해 과도하게 투자되었던 주식 자산 **${Number(totalToLiquidate).toLocaleString()} WLD**를 국고 금고로 즉시 회수 환원하였습니다.`,
        color: 0x10b981,
        fields: [
          {
            name: '💰 확보된 국고 현금',
            value: `**${Number(currentCash).toLocaleString()} WLD** (안전 바닥 보존 완료)`,
            inline: true,
          },
          {
            name: '📊 조정된 주식 포트폴리오',
            value: `${Number(finalPortfolio).toLocaleString()} WLD (전체의 약 16%)`,
            inline: true,
          },
          {
            name: '🏛️ 국고 총자산 (AUM)',
            value: `**${Number(finalTotalAum).toLocaleString()} WLD**`,
            inline: false,
          },
        ],
      };

      this.discordAlert.sendAdminDirectMessage(embed).catch(() => {});
      this.discordAlert.sendDiscordEmbed(embed).catch(() => {});

      this.logger.log(
        `Treasury liquidated to vault successfully: +${totalToLiquidate} WLD recovered to cash. New cash: ${currentCash} WLD, New portfolio: ${finalPortfolio} WLD.`,
      );

      return {
        success: true,
        liquidatedWld: totalToLiquidate.toString(),
        vaultCashAfter: currentCash.toString(),
        portfolioAfter: finalPortfolio.toString(),
        totalAum: finalTotalAum.toString(),
      };
    } catch (err) {
      await client.query('ROLLBACK');
      this.logger.error('Failed to liquidate portfolio to treasury vault', err);
      throw err;
    } finally {
      client.release();
    }
  }
}
