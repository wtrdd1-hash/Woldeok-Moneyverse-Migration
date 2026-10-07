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
        is_enabled: true,
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

      // 2. [공기업 법정 배당 및 민간 상장 기업 법인세 자동 징수] (Autonomous Corporate & SOE Dividend Stream)
      // WSHC 산하 3대 공기업(W-Power, W-Net, WDB) 법정 이익배당(30%) + WDX 기업 법인세 자동 징수
      let taxCollected = BigInt(0);
      if (config.auto_tax_enabled) {
        // 공기업 3사 배당 (W-Power 36,000 + W-Net 27,000 + WDB 45,000 = 108,000 WLD) + 민간 기업 법인세 (16,000 WLD) = 124,000 WLD
        taxCollected = BigInt(124000);
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
              $1, 'FEE_RECIRCULATION', $2,
              '국가 3대 기간 공기업(W-Power, W-Net, WDB) 법정 이익배당 및 민간 기업 법인세 국고 자동 징수',
              $3, $4, clock_timestamp()
           )`,
          [
            vaultId,
            taxCollected.toString(),
            (currentCash - taxCollected).toString(),
            currentCash.toString(),
          ],
        );

        // state_enterprise_dividend_logs에 기록 업데이트
        await client.query(`
          INSERT INTO public.state_enterprise_dividend_logs (enterprise_id, dividend_amount_wld, revenue_wld, net_profit_wld, eval_grade)
          SELECT id, (net_profit_hourly_wld * dividend_rate_bps / 10000), operating_revenue_hourly_wld, net_profit_hourly_wld, eval_grade
          FROM public.state_enterprises
          WHERE status = 'ACTIVE'
        `).catch(() => {});

        // [기획재정국채(KTB) 시간당 확정 쿠폰 이자 지급 및 만기 상환 정산]
        await client.query(`
          DO $$
          DECLARE
            h RECORD;
            coupon NUMERIC;
            principal NUMERIC;
            u_account_id UUID;
          BEGIN
            FOR h IN
              SELECT th.id, th.user_id, th.bond_id, th.units, tb.par_value_wld, tb.hourly_coupon_rate_bps, (th.maturity_at <= now()) AS is_matured
              FROM public.treasury_bond_holdings th
              JOIN public.treasury_bonds tb ON tb.id = th.bond_id
              WHERE th.status = 'HOLDING'
            LOOP
              principal := h.units * h.par_value_wld;
              coupon := FLOOR(principal * h.hourly_coupon_rate_bps / 10000);

              SELECT id INTO u_account_id FROM public.accounts WHERE owner_user_id = h.user_id AND account_type = 'USER_CASH' LIMIT 1;

              IF coupon > 0 AND u_account_id IS NOT NULL THEN
                UPDATE public.account_balances SET available_amount = available_amount + coupon, updated_at = now() WHERE account_id = u_account_id;
                UPDATE public.treasury_bond_holdings SET accrued_interest_wld = accrued_interest_wld + coupon, updated_at = now() WHERE id = h.id;
                INSERT INTO public.treasury_bond_coupon_logs (holding_id, user_id, bond_id, event_type, amount_wld)
                VALUES (h.id, h.user_id, h.bond_id, 'COUPON_INTEREST', coupon);
              END IF;

              IF h.is_matured AND u_account_id IS NOT NULL THEN
                UPDATE public.account_balances SET available_amount = available_amount + principal, updated_at = now() WHERE account_id = u_account_id;
                UPDATE public.treasury_bond_holdings SET status = 'MATURED', updated_at = now() WHERE id = h.id;
                INSERT INTO public.treasury_bond_coupon_logs (holding_id, user_id, bond_id, event_type, amount_wld)
                VALUES (h.id, h.user_id, h.bond_id, 'MATURITY_REDEMPTION', principal);
              END IF;
            END LOOP;
          END $$;
        `).catch(() => {});

        // [국가 국민연금(NPS) 은퇴자 대상 1시간 주기 공적 기초연금 자동 지급]
        await client.query(`
          DO $$
          DECLARE
            p RECORD;
            payout NUMERIC;
            u_account_id UUID;
          BEGIN
            FOR p IN
              SELECT id, user_id, accumulated_contribution_wld, hourly_payout_rate_bps
              FROM public.national_pension_accounts
              WHERE status = 'RETIRED_RECEIVING' AND accumulated_contribution_wld > 0
            LOOP
              payout := GREATEST(1, FLOOR(p.accumulated_contribution_wld * p.hourly_payout_rate_bps / 10000));
              SELECT id INTO u_account_id FROM public.accounts WHERE owner_user_id = p.user_id AND account_type = 'USER_CASH' LIMIT 1;
              IF payout > 0 AND u_account_id IS NOT NULL THEN
                UPDATE public.account_balances SET available_amount = available_amount + payout, updated_at = now() WHERE account_id = u_account_id;
                UPDATE public.national_pension_accounts SET total_payout_received_wld = total_payout_received_wld + payout, last_payout_at = now(), updated_at = now() WHERE id = p.id;
                INSERT INTO public.national_pension_payout_logs (account_id, user_id, payout_amount_wld, snapshot_accumulated_wld)
                VALUES (p.id, p.user_id, payout, p.accumulated_contribution_wld);
              END IF;
            END LOOP;
          END $$;
        `).catch(() => {});
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

      // 4. [국고 자금 안전 보존 및 적정 비율 자율 재투자] (Treasury Capital Governance Reinvestment)
      // 국가 필수 시스템(비상 완충, 인프라, 통화안정, 복지)을 위해 국고의 대부분(80% 이상)은 현금으로 영구 보존.
      // 관리자가 지정한 적정 재투자 비율(config.reinvestment_ratio_pct, 기본 15%)과 최대 투자 한도(config.max_investment_ratio_pct, 기본 20%)를 엄격히 준수.
      let reinvestedWld = BigInt(0);
      let stockAlloc = BigInt(0);
      let bondAlloc = BigInt(0);
      let dividendAlloc = BigInt(0);

      // 현재 국부펀드 보유 포트폴리오 평가 총액 사전 조회
      const preValRes = await client.query<{ sum: string }>(
        `SELECT COALESCE(SUM(current_valuation_wld::numeric), 0)::text as sum FROM public.treasury_swf_portfolios`,
      );
      const portfolioBefore = BigInt(preValRes.rows[0]?.sum || '0');
      const totalAumBefore = currentCash + portfolioBefore;

      // 최대 투자 허용 상한(예: 국고 총자산의 20%) 산출
      const maxInvestCapPct = BigInt(Math.max(5, Math.min(50, Math.round(config.max_investment_ratio_pct || 20))));
      const maxAllowedPortfolioAum = (totalAumBefore * maxInvestCapPct) / BigInt(100);

      if (currentCash > floorReserve && portfolioBefore < maxAllowedPortfolioAum) {
        const surplusCash = currentCash - floorReserve;
        const investRatioPct = BigInt(Math.max(0, Math.min(50, Math.round(config.reinvestment_ratio_pct || 15))));

        // 잉여금 중 관리자 설정 비율(기본 15%)만 투자로 배정, 나머지 85%는 국고 금고 현금으로 상시 보존
        let targetReinvest = (surplusCash * investRatioPct) / BigInt(100);

        // 최대 허용 포트폴리오 상한 초과 방지 캡 적용
        const headroom = maxAllowedPortfolioAum - portfolioBefore;
        if (targetReinvest > headroom) {
          targetReinvest = headroom;
        }

        const maxSingle = BigInt(config.max_single_investment_wld || '10000000');
        if (targetReinvest > maxSingle) {
          targetReinvest = maxSingle;
        }

        reinvestedWld = targetReinvest;

        if (reinvestedWld >= BigInt(50000)) {
          stockAlloc = (reinvestedWld * BigInt(60)) / BigInt(100);
          bondAlloc = (reinvestedWld * BigInt(30)) / BigInt(100);
          dividendAlloc = reinvestedWld - stockAlloc - bondAlloc;

          // 현금 차감 (국고 금고에서 투자 자금 출금)
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
                '국고 자금 헌법적 거버넌스 재투자 (투자비율 ' || $5 || '%, 국고 안전보존 ' || $6 || '%): 주식 60%, 국채 30%, 시민배당 10%',
                $3, $4, clock_timestamp()
             )`,
            [
              vaultId,
              reinvestedWld.toString(),
              (currentCash + reinvestedWld).toString(),
              currentCash.toString(),
              investRatioPct.toString(),
              (BigInt(100) - investRatioPct).toString(),
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
            `SELECT id FROM public.users WHERE status = 'active' ORDER BY created_at DESC LIMIT 50`,
          );
          if (activeUsers.rows.length > 0 && dividendAlloc > BigInt(0)) {
            const perUser = dividendAlloc / BigInt(activeUsers.rows.length);
            if (perUser > BigInt(0)) {
              for (const u of activeUsers.rows) {
                await client.query(
                  `UPDATE public.account_balances
                   SET available_amount = available_amount + $1, updated_at = clock_timestamp()
                   WHERE account_id = (SELECT id FROM public.accounts WHERE owner_user_id = $2 AND account_type = 'USER_CASH' LIMIT 1)`,
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
      const floorReserveFormatted = Number(floorReserve).toLocaleString();
      const floorReserveTenThousand = (Number(floorReserve) / 10000).toLocaleString();
      const isUnderFloor = currentCash <= floorReserve;

      const embed = {
        title: `📈 [국고 복리 성장 엔진] ${floorReserveTenThousand}만 WLD 보존 & 자율 성장 사이클 집행`,
        description: isUnderFloor
          ? `국고 현금이 관리자 설정 안전 바닥(**${floorReserveFormatted} WLD**)을 보존 중입니다. 국가 재정 및 안전망 유지를 위해 추가 투자를 원천 차단하고 국고 현금을 100% 철저히 보호하고 있습니다.`
          : `국고 최소 안전 바닥 **${floorReserveFormatted} WLD**를 완벽 보존하고, 초과 잉여분의 적정 비율(${config.reinvestment_ratio_pct || 15}%)만 자율 분산 투자하여 총자산을 건전하게 증식하고 있습니다.`,
        color: isUnderFloor ? 0x10b981 : 0x3b82f6,
        fields: [
          {
            name: '💰 국고 현금 잔액',
            value: `${Number(currentCash).toLocaleString()} WLD (바닥 ${floorReserveFormatted} WLD 보존)`,
            inline: true,
          },
          { name: '📊 포트폴리오 가치', value: `${Number(portfolioTotal).toLocaleString()} WLD`, inline: true },
          { name: '🏛️ 국고 총자산 (AUM)', value: `**${Number(totalAum).toLocaleString()} WLD** (지속 우상향)`, inline: false },
          { name: '🏢 가상 기업 법인세 유입', value: `+${Number(taxCollected).toLocaleString()} WLD`, inline: true },
          { name: '🌾 투자 수익 실현 (Harvest)', value: `+${Number(harvestedWld).toLocaleString()} WLD`, inline: true },
          {
            name: '🔄 자율 복리 재투자',
            value: isUnderFloor
              ? `0 WLD (안전 바닥 보호로 투자 보류)`
              : `${Number(reinvestedWld).toLocaleString()} WLD (잉여분 ${config.reinvestment_ratio_pct || 15}% 배정)`,
            inline: true,
          },
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
            $1, 'REBALANCE_LIQUIDATE_TO_TREASURY', $2,
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
