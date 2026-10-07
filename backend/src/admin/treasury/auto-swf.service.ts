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
    const ONE_HOUR_MS = 60 * 60 * 1000;

    // 서버 기동 30초 후 초기 자율 성장 평가 및 리밸런싱 실행
    setTimeout(() => {
      void this.evaluateAndRebalance().catch((err) => {
        this.logger.error('Failed initial SWF compounding growth evaluation', err);
      });
    }, 30_000);

    // 1시간 주기 자율 복리 국고 성장 및 투자 재순환 스케줄러
    this.timer = setInterval(() => {
      void this.evaluateAndRebalance().catch((err) => {
        this.logger.error('Failed scheduled SWF compounding growth evaluation', err);
      });
    }, ONE_HOUR_MS);

    this.logger.log('AutoSovereignWealthFundService initialized: 1-hour autonomous compounding growth engine scheduled.');
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
        is_enabled: true,
        safe_reserve_wld: '25000000',
        max_single_investment_wld: '10000000',
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

  /**
   * 국고 2,500만 WLD 최소 안전 원금 보존 및 복리 우상향 성장(Net Compounding Growth) 실행 엔진
   * 1. 가상 상장 우량 기업 자체 영업 이익 및 법인세 자동 징수 (유저가 없어도 국고로 세수 지속 유입)
   * 2. 국부펀드 보유 포트폴리오 평가 이익 상승 및 수익 실현(Harvest)
   * 3. 2,500만 WLD 초과 잉여금의 우량주/국채 자율 재투자 (Compound Reinvestment)
   * 4. 국고 총자산(AUM = 국고 현금 + 주식 + 채권)의 무한 우상향 성장 달성
   */
  async evaluateAndRebalance(): Promise<{
    executed: boolean;
    totalAumWld?: string;
    vaultCashWld?: string;
    taxCollectedWld?: string;
    harvestedWld?: string;
    reinvestedWld?: string;
    reason?: string;
  }> {
    const config = await this.getConfig();
    if (!config.is_enabled) {
      return { executed: false, reason: 'SWF_AUTONOMOUS_INVESTMENT_DISABLED' };
    }

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // 1. 메인 국고 금고(VAULT_MAIN) 잔액 조회
      const vaultRes = await client.query<{ id: string; balance_wld: string }>(
        `SELECT id, balance_wld::text FROM public.system_treasury_vaults WHERE code = 'VAULT_MAIN' FOR UPDATE`,
      );
      if (!vaultRes.rows[0]) {
        await client.query('ROLLBACK');
        return { executed: false, reason: 'VAULT_MAIN_NOT_FOUND' };
      }

      const vaultId = vaultRes.rows[0].id;
      let currentCash = BigInt(vaultRes.rows[0].balance_wld);
      const floorReserve = BigInt(config.safe_reserve_wld || '25000000');

      // 2. [가상 상장 기업 영업 이익 및 법인세 자동 징수] (Autonomous Corporate Tax Stream)
      // WDX 4대 대기업에서 시간당 발생하는 가상 영업 매출 중 법인세 징수 (총 80,000 WLD)
      let taxCollected = BigInt(0);
      if (config.auto_tax_enabled) {
        taxCollected = BigInt(80000);
        currentCash += taxCollected;

        await client.query(
          `UPDATE public.system_treasury_vaults
           SET balance_wld = (balance_wld::numeric + $1)::text, updated_at = clock_timestamp()
           WHERE id = $2`,
          [taxCollected.toString(), vaultId],
        );

        await client.query(
          `INSERT INTO public.system_treasury_ledger (
              vault_id, tx_type, amount_wld, reason, balance_before, balance_after, created_at
           ) VALUES (
              $1, 'STOCK_SPECULATION_TAX', $2,
              '가상 우량 상장 기업(WDX) 영업 이익 법인세 및 시장 거래세 국고 자동 징수',
              $3, $4, clock_timestamp()
           )`,
          [
            vaultId,
            taxCollected.toString(),
            (currentCash - taxCollected).toString(),
            currentCash.toString(),
          ],
        );
      }

      // 3. [국부펀드 자산 평가 이익 및 수익 회수] (Auto Asset Growth & Harvest)
      // 보유 포트폴리오의 자산 가치를 시간당 약 1.2% 상승시키고 평가 이익 중 30%를 국고로 회수 환원
      let harvestedWld = BigInt(0);
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

      for (const row of portfolioRows.rows) {
        const currentVal = BigInt(row.current_valuation_wld);
        // 시간당 약 1.2% 자산 가치 증가 (기초 성장)
        const growth = (currentVal * BigInt(120)) / BigInt(10000);
        const newVal = currentVal + growth;

        // 수익 중 30%는 국고 현금으로 회수(Harvest), 70%는 자산 가치로 누적
        const harvestFromAsset = (growth * BigInt(30)) / BigInt(100);
        harvestedWld += harvestFromAsset;

        const finalVal = newVal - harvestFromAsset;
        const invested = BigInt(row.total_invested_wld);
        const unrealizedPnl = finalVal - invested;

        await client.query(
          `UPDATE public.treasury_swf_portfolios
           SET current_valuation_wld = $1::numeric,
               unrealized_pnl_wld = $2::numeric,
               updated_at = clock_timestamp()
           WHERE id = $3`,
          [finalVal.toString(), unrealizedPnl.toString(), row.id],
        );
      }

      if (harvestedWld > BigInt(0) && config.auto_harvest_enabled) {
        currentCash += harvestedWld;
        await client.query(
          `UPDATE public.system_treasury_vaults
           SET balance_wld = (balance_wld::numeric + $1)::text, updated_at = clock_timestamp()
           WHERE id = $2`,
          [harvestedWld.toString(), vaultId],
        );

        await client.query(
          `INSERT INTO public.system_treasury_ledger (
              vault_id, tx_type, amount_wld, reason, balance_before, balance_after, created_at
           ) VALUES (
              $1, 'FEE_RECIRCULATION', $2,
              '국부펀드(ASWF) 투자 자산 운용 수익 실현(Harvest) 국고 현금 흡수',
              $3, $4, clock_timestamp()
           )`,
          [
            vaultId,
            harvestedWld.toString(),
            (currentCash - harvestedWld).toString(),
            currentCash.toString(),
          ],
        );
      }

      // 4. [2,500만 WLD 초과 잉여분의 복리 재투자] (Compound Reinvestment)
      // 2,500만 WLD를 초과하는 현금 중 70%를 다시 우량주 및 안전 자산에 재투자하여 AUM 팽창
      let reinvestedWld = BigInt(0);
      let stockAlloc = BigInt(0);
      let bondAlloc = BigInt(0);
      let dividendAlloc = BigInt(0);

      if (currentCash > floorReserve) {
        const surplusCash = currentCash - floorReserve;
        // 초과분의 70% 재투자, 30%는 국고 현금 버퍼로 보존하여 국고 현금 자체도 우상향
        reinvestedWld = (surplusCash * BigInt(70)) / BigInt(100);
        const maxSingle = BigInt(config.max_single_investment_wld || '10000000');
        if (reinvestedWld > maxSingle) {
          reinvestedWld = maxSingle;
        }

        if (reinvestedWld >= BigInt(50000)) {
          stockAlloc = (reinvestedWld * BigInt(60)) / BigInt(100);
          bondAlloc = (reinvestedWld * BigInt(30)) / BigInt(100);
          dividendAlloc = reinvestedWld - stockAlloc - bondAlloc;

          // 현금 차감
          currentCash -= reinvestedWld;
          await client.query(
            `UPDATE public.system_treasury_vaults
             SET balance_wld = (balance_wld::numeric - $1)::text, updated_at = clock_timestamp()
             WHERE id = $2`,
            [reinvestedWld.toString(), vaultId],
          );

          await client.query(
            `INSERT INTO public.system_treasury_ledger (
                vault_id, tx_type, amount_wld, reason, balance_before, balance_after, created_at
             ) VALUES (
                $1, 'MARKET_STIMULUS', $2,
                '국고 2,500만 WLD 초과 세수 복리 재투자(주식 60%, 국채 30%, 시민배당 10%)',
                $3, $4, clock_timestamp()
             )`,
            [
              vaultId,
              reinvestedWld.toString(),
              (currentCash + reinvestedWld).toString(),
              currentCash.toString(),
            ],
          );

          // WDX 4대 대표주 균등 매수
          const symbols = ['WDX-TEC', 'WDX-FIN', 'WDX-BIO', 'WDX-RET'];
          const perStock = stockAlloc / BigInt(symbols.length);
          for (const sym of symbols) {
            await client.query(
              `UPDATE public.treasury_swf_portfolios
               SET total_invested_wld = total_invested_wld + $1::numeric,
                   current_valuation_wld = current_valuation_wld + $1::numeric,
                   updated_at = clock_timestamp()
               WHERE asset_symbol = $2`,
              [perStock.toString(), sym],
            );
          }

          // 활성 시민 배당
          const activeUsers = await client.query<{ id: string }>(
            `SELECT id FROM public.users WHERE status = 'ACTIVE' ORDER BY updated_at DESC LIMIT 50`,
          );
          if (activeUsers.rows.length > 0 && dividendAlloc > BigInt(0)) {
            const perUser = dividendAlloc / BigInt(activeUsers.rows.length);
            if (perUser > BigInt(0)) {
              for (const u of activeUsers.rows) {
                await client.query(
                  `UPDATE public.account_balances
                   SET available_amount = available_amount + $1, updated_at = clock_timestamp()
                   WHERE account_id = (SELECT id FROM public.accounts WHERE user_id = $2 AND account_type = 'CHECKING' LIMIT 1)`,
                  [perUser.toString(), u.id],
                );
              }
            }
          }
        }
      }

      // 5. 총 운용 자산(AUM = 국고 현금 + 포트폴리오 가치) 산출
      const totalValRes = await client.query<{ sum: string }>(
        `SELECT COALESCE(SUM(current_valuation_wld::numeric), 0)::text as sum FROM public.treasury_swf_portfolios`,
      );
      const portfolioTotal = BigInt(totalValRes.rows[0]?.sum || '0');
      const totalAum = currentCash + portfolioTotal;

      // 6. SWF 이벤트 타임라인 기록
      await client.query(
        `INSERT INTO public.treasury_swf_events (event_type, amount_wld, summary, metadata)
         VALUES (
            'COMPOUND_GROWTH_CYCLE', $1,
            '국고 자율 복리 성장 사이클 집행: 세수 유입 +' || $2 || ' WLD, 수익 실현 +' || $3 || ' WLD, 재투자 ' || $4 || ' WLD (총 AUM: ' || $5 || ' WLD)',
            $6
         )`,
        [
          reinvestedWld.toString(),
          taxCollected.toString(),
          harvestedWld.toString(),
          reinvestedWld.toString(),
          totalAum.toString(),
          JSON.stringify({
            vault_cash_wld: currentCash.toString(),
            portfolio_aum_wld: portfolioTotal.toString(),
            total_aum_wld: totalAum.toString(),
            tax_collected: taxCollected.toString(),
            harvested_wld: harvestedWld.toString(),
            reinvested_wld: reinvestedWld.toString(),
            timestamp: new Date().toISOString(),
          }),
        ],
      );

      // 7. 최종 설정 시간 갱신
      await client.query(
        `UPDATE public.treasury_swf_configs
         SET last_executed_at = clock_timestamp(), updated_at = clock_timestamp()
         WHERE id = 'current'`,
      );

      await client.query('COMMIT');

      // 8. 디스코드 관리자(`886478189520637992`) 1:1 DM 및 시스템 로그 알림 발송
      const embed = {
        title: '📈 [국고 복리 성장 엔진] 2,500만 원 보존 & 자율 성장 사이클 집행',
        description: `국고 최소 안전 바닥 **25,000,000 WLD**를 완벽 보존하고, 자율 경제 엔진을 통해 총자산이 지속 성장하고 있습니다.`,
        color: 0x3b82f6,
        fields: [
          { name: '💰 국고 현금 잔액', value: `${Number(currentCash).toLocaleString()} WLD (바닥 2500만 보존)`, inline: true },
          { name: '📊 포트폴리오 가치', value: `${Number(portfolioTotal).toLocaleString()} WLD`, inline: true },
          { name: '🏛️ 국고 총자산 (AUM)', value: `**${Number(totalAum).toLocaleString()} WLD** (지속 우상향)`, inline: false },
          { name: '🏢 가상 기업 법인세 유입', value: `+${Number(taxCollected).toLocaleString()} WLD`, inline: true },
          { name: '🌾 투자 수익 실현 (Harvest)', value: `+${Number(harvestedWld).toLocaleString()} WLD`, inline: true },
          { name: '🔄 자율 복리 재투자', value: `${Number(reinvestedWld).toLocaleString()} WLD`, inline: true },
        ],
      };

      this.discordAlert.sendAdminDirectMessage(embed).catch(() => {});
      this.discordAlert.sendDiscordEmbed(embed).catch(() => {});

      this.logger.log(`Autonomous Treasury compounding growth completed. Total AUM: ${totalAum} WLD (Cash: ${currentCash} WLD)`);
      return {
        executed: true,
        totalAumWld: totalAum.toString(),
        vaultCashWld: currentCash.toString(),
        taxCollectedWld: taxCollected.toString(),
        harvestedWld: harvestedWld.toString(),
        reinvestedWld: reinvestedWld.toString(),
      };
    } catch (error) {
      await client.query('ROLLBACK');
      this.logger.error('Failed to evaluate autonomous treasury growth', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async updateConfig(params: Partial<SwfConfig>): Promise<SwfConfig> {
    await queryRows(
      this.pool,
      `UPDATE public.treasury_swf_configs
       SET is_enabled = COALESCE($1, is_enabled),
           safe_reserve_wld = COALESCE($2, safe_reserve_wld),
           max_single_investment_wld = COALESCE($3, max_single_investment_wld),
           updated_at = clock_timestamp()
       WHERE id = 'current'`,
      [params.is_enabled, params.safe_reserve_wld, params.max_single_investment_wld],
    );
    return this.getConfig();
  }
}
