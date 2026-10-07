import { Inject, Injectable, Logger, type OnModuleInit, type OnModuleDestroy } from '@nestjs/common';
import type { Pool } from 'pg';
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
  rebalance_interval_hours: number;
  last_executed_at: Date | null;
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
  updated_at: Date;
}

export interface SwfEvent {
  id: string;
  event_type: string;
  amount_wld: string;
  summary: string;
  metadata: Record<string, unknown>;
  created_at: Date;
}

const CHECK_INTERVAL_MS = 60 * 60_000; // 1시간 주기

@Injectable()
export class AutoSovereignWealthFundService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AutoSovereignWealthFundService.name);
  private timer: NodeJS.Timeout | null = null;

  constructor(
    @Inject(PG_POOL) private readonly pool: Pool,
    private readonly discordAlert: DiscordAlertService,
  ) {}

  onModuleInit() {
    // 부팅 45초 후 초기 1회 점검, 이후 1시간마다 자동 실행
    setTimeout(() => {
      this.evaluateAndRebalance().catch((err) => {
        this.logger.error('Initial SWF rebalance evaluation failed', err);
      });
    }, 45_000);

    this.timer = setInterval(() => {
      this.evaluateAndRebalance().catch((err) => {
        this.logger.error('Scheduled SWF rebalance evaluation failed', err);
      });
    }, CHECK_INTERVAL_MS);

    this.logger.log('AutoSovereignWealthFundService initialized: 1-hour autonomous fiscal recirculation scheduled.');
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
              rebalance_interval_hours, last_executed_at
       FROM public.treasury_swf_configs
       WHERE id = 'current'
       LIMIT 1`,
    );
    if (!rows[0]) {
      return {
        id: 'current',
        is_enabled: true,
        safe_reserve_wld: '50000000',
        max_single_investment_wld: '10000000',
        equity_ratio_pct: 50.0,
        bond_ratio_pct: 30.0,
        dividend_ratio_pct: 20.0,
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
   * 국고 잉여 세수 자율 투자 및 시장 재순환 실행 엔진
   */
  async evaluateAndRebalance(): Promise<{
    executed: boolean;
    investedWld?: string;
    stockWld?: string;
    bondWld?: string;
    dividendWld?: string;
    reason?: string;
  }> {
    const config = await this.getConfig();
    if (!config.is_enabled) {
      return { executed: false, reason: 'SWF_AUTONOMOUS_INVESTMENT_DISABLED' };
    }

    // 1. 메인 국고 금고(VAULT_MAIN) 잔액 조회
    const vaultRows = await queryRows<{ balance_wld: string }>(
      this.pool,
      `SELECT balance_wld::text FROM public.treasury_vaults WHERE code = 'VAULT_MAIN' LIMIT 1`,
    );
    const mainBalance = vaultRows[0] ? BigInt(vaultRows[0].balance_wld) : BigInt(0);
    const safeReserve = BigInt(config.safe_reserve_wld);

    // 2. 안전 준비금 초과 여부 확인
    if (mainBalance <= safeReserve) {
      return {
        executed: false,
        reason: `MAIN_VAULT_BELOW_SAFE_RESERVE (${mainBalance} <= ${safeReserve})`,
      };
    }

    // 3. 잉여 세수 중 1회 집행 금액 산출 (초과분의 10% 또는 최대 한도 중 작은 값)
    const surplus = mainBalance - safeReserve;
    const maxSingle = BigInt(config.max_single_investment_wld);
    let investmentAmount = surplus / BigInt(10);
    if (investmentAmount > maxSingle) {
      investmentAmount = maxSingle;
    }
    if (investmentAmount < BigInt(100000)) {
      return { executed: false, reason: 'SURPLUS_TOO_SMALL_FOR_REBALANCE' };
    }

    // 4. 자산 배분 계산: 주식(50%), 채권(30%), 시민 배당(20%)
    const stockAlloc = (investmentAmount * BigInt(50)) / BigInt(100);
    const bondAlloc = (investmentAmount * BigInt(30)) / BigInt(100);
    const dividendAlloc = investmentAmount - stockAlloc - bondAlloc;

    // 5. 트랜잭션 내에서 집행
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // 5-1. 국고 금고에서 투자액 차감
      await client.query(
        `UPDATE public.treasury_vaults
         SET balance_wld = balance_wld - $1, updated_at = clock_timestamp()
         WHERE code = 'VAULT_MAIN'`,
        [investmentAmount.toString()],
      );

      // 5-2. 국고 원장(treasury_ledger)에 투자 지출 기록
      await client.query(
        `INSERT INTO public.treasury_ledger (
            vault_id, vault_code, vault_name, tx_type, amount_wld,
            actor_id, actor_name, reason, balance_before, balance_after
         ) VALUES (
            (SELECT id FROM public.treasury_vaults WHERE code = 'VAULT_MAIN'),
            'VAULT_MAIN', '중앙 국고 본 금고', 'MARKET_STIMULUS', $1,
            NULL, 'Autonomous Sovereign Wealth Fund',
            '국고 잉여 세수 자율 투자 및 시장 재순환(주식 50%, 국채 30%, 시민배당 20%)',
            $2, ($2::numeric - $1::numeric)
         )`,
        [investmentAmount.toString(), mainBalance.toString()],
      );

      // 5-3. WDX 4대 우량주 균등 분산 매수 반영
      const symbols = ['WDX-TEC', 'WDX-FIN', 'WDX-BIO', 'WDX-RET'];
      const perStockAlloc = stockAlloc / BigInt(symbols.length);
      for (const symbol of symbols) {
        await client.query(
          `UPDATE public.treasury_swf_portfolios
           SET total_invested_wld = total_invested_wld + $1,
               current_valuation_wld = current_valuation_wld + $1,
               updated_at = clock_timestamp()
           WHERE asset_symbol = $2`,
          [perStockAlloc.toString(), symbol],
        );
      }

      // 5-4. 활성 유저 대상 기본소득 배당 분배
      const activeUsers = await client.query<{ id: string }>(
        `SELECT id FROM public.users
         WHERE status = 'ACTIVE'
         ORDER BY updated_at DESC
         LIMIT 100`,
      );
      if (activeUsers.rows.length > 0) {
        const perUserDividend = dividendAlloc / BigInt(activeUsers.rows.length);
        if (perUserDividend > BigInt(0)) {
          for (const user of activeUsers.rows) {
            await client.query(
              `UPDATE public.account_balances
               SET available_amount = available_amount + $1, updated_at = clock_timestamp()
               WHERE account_id = (SELECT id FROM public.accounts WHERE user_id = $2 AND account_type = 'CHECKING' LIMIT 1)`,
              [perUserDividend.toString(), user.id],
            );
          }
        }
      }

      // 5-5. SWF 이벤트 타임라인 기록
      await client.query(
        `INSERT INTO public.treasury_swf_events (event_type, amount_wld, summary, metadata)
         VALUES (
            'REBALANCE_AND_DIVIDEND', $1,
            '국부펀드 자율 리밸런싱 집행: WDX 우량주 매수 ' || $2 || ' WLD, 국채 예치 ' || $3 || ' WLD, 시민 배당 ' || $4 || ' WLD',
            $5
         )`,
        [
          investmentAmount.toString(),
          stockAlloc.toString(),
          bondAlloc.toString(),
          dividendAlloc.toString(),
          JSON.stringify({
            surplus: surplus.toString(),
            active_beneficiaries: activeUsers.rows.length,
            timestamp: new Date().toISOString(),
          }),
        ],
      );

      // 5-6. 설정 마지막 실행 시각 갱신
      await client.query(
        `UPDATE public.treasury_swf_configs
         SET last_executed_at = clock_timestamp(), updated_at = clock_timestamp()
         WHERE id = 'current'`,
      );

      await client.query('COMMIT');

      // 6. 디스코드 관리자 1:1 DM 및 로그 채널 브로드캐스팅
      const embed = {
        title: '🏛️ [자율 국부펀드] 국고 잉여 세수 시장 재순환 집행 완료',
        description: `국고 유휴 잉여 세수 **${Number(investmentAmount).toLocaleString()} WLD**가 자율 국부펀드(ASWF) 엔진을 통해 시장으로 재순환되었습니다.`,
        color: 0x10b981,
        fields: [
          { name: '📊 WDX 우량주 매수', value: `${Number(stockAlloc).toLocaleString()} WLD (증시 부양)`, inline: true },
          { name: '🏦 국채/채권 예치', value: `${Number(bondAlloc).toLocaleString()} WLD (안정 수익)`, inline: true },
          { name: '🎁 시민 기본소득 배당', value: `${Number(dividendAlloc).toLocaleString()} WLD (${activeUsers.rows.length}명)`, inline: true },
          { name: '경제 효과', value: '시중 유동성 경색 해소 · 주가 안전판 확보 · 유저 잔존율 강화', inline: false },
        ],
      };

      this.discordAlert.sendAdminDirectMessage(embed).catch(() => {});
      this.discordAlert.sendDiscordEmbed(embed).catch(() => {});

      this.logger.log(`Autonomous SWF rebalance executed: ${investmentAmount} WLD redistributed to markets and citizens.`);
      return {
        executed: true,
        investedWld: investmentAmount.toString(),
        stockWld: stockAlloc.toString(),
        bondWld: bondAlloc.toString(),
        dividendWld: dividendAlloc.toString(),
      };
    } catch (error) {
      await client.query('ROLLBACK');
      this.logger.error('Failed to execute autonomous SWF rebalance', error);
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
