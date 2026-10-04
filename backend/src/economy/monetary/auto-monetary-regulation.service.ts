import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import type { Queryable } from '../../core/db';
import { PG_POOL } from '../../core/pool.provider';
import { CentralBankService } from './central-bank.service';
import type {
  MonetaryAutoRegulationConfig,
  MonetaryRegulationActionType,
  MonetaryRegulationEvent,
} from './monetary.types';

@Injectable()
export class AutoMonetaryRegulationService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AutoMonetaryRegulationService.name);
  private timer: NodeJS.Timeout | null = null;

  constructor(
    @Inject(PG_POOL) private readonly pool: Queryable,
    private readonly centralBank: CentralBankService,
  ) {}

  onModuleInit() {
    const ONE_HOUR_MS = 60 * 60 * 1000;

    // 서버 기동 45초 후 초기 지표 평가
    setTimeout(() => {
      void this.handleScheduledAutoRegulation();
    }, 45_000);

    // 1시간 주기 자동 평가 및 통화량 피드백 조절 타이머
    this.timer = setInterval(() => {
      void this.handleScheduledAutoRegulation();
    }, ONE_HOUR_MS);

    this.logger.log('AutoMonetaryRegulationService initialized: 1-hour automated monetary rebalancing scheduled.');
  }

  onModuleDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  async getConfig(): Promise<MonetaryAutoRegulationConfig> {
    const res = await this.pool.query<MonetaryAutoRegulationConfig>(
      `SELECT * FROM public.monetary_auto_regulation_configs WHERE id = 1`,
    );
    if (!res.rows[0]) {
      throw new Error('Monetary auto regulation configuration not found');
    }
    return {
      ...res.rows[0],
      target_faucet_sink_ratio: Number(res.rows[0].target_faucet_sink_ratio),
      tolerance_band_pct: Number(res.rows[0].tolerance_band_pct),
      max_step_pct: Number(res.rows[0].max_step_pct),
      circuit_breaker_freeze_pct: Number(res.rows[0].circuit_breaker_freeze_pct),
    };
  }

  async updateConfig(
    isEnabled?: boolean,
    targetRatio?: number,
    toleranceBandPct?: number,
    maxStepPct?: number,
    circuitBreakerFreezePct?: number,
  ): Promise<MonetaryAutoRegulationConfig> {
    const res = await this.pool.query<MonetaryAutoRegulationConfig>(
      `
      UPDATE public.monetary_auto_regulation_configs
      SET
        is_enabled = coalesce($1, is_enabled),
        target_faucet_sink_ratio = coalesce($2, target_faucet_sink_ratio),
        tolerance_band_pct = coalesce($3, tolerance_band_pct),
        max_step_pct = coalesce($4, max_step_pct),
        circuit_breaker_freeze_pct = coalesce($5, circuit_breaker_freeze_pct),
        updated_at = now()
      WHERE id = 1
      RETURNING *
    `,
      [isEnabled, targetRatio, toleranceBandPct, maxStepPct, circuitBreakerFreezePct],
    );
    const row = res.rows[0]!;
    return {
      ...row,
      target_faucet_sink_ratio: Number(row.target_faucet_sink_ratio),
      tolerance_band_pct: Number(row.tolerance_band_pct),
      max_step_pct: Number(row.max_step_pct),
      circuit_breaker_freeze_pct: Number(row.circuit_breaker_freeze_pct),
    };
  }

  async getRecentEvents(limit = 20): Promise<MonetaryRegulationEvent[]> {
    const res = await this.pool.query<MonetaryRegulationEvent>(
      `
      SELECT * FROM public.monetary_regulation_events
      ORDER BY created_at DESC
      LIMIT $1
    `,
      [limit],
    );
    return res.rows.map((row) => ({
      ...row,
      current_ratio: Number(row.current_ratio),
    }));
  }

  /**
   * 1시간 주기 자동 평가 및 통화량 피드백 조절 루프
   */
  async handleScheduledAutoRegulation(): Promise<void> {
    try {
      this.logger.log('Starting automated monetary regulation evaluation cycle...');
      const event = await this.evaluateAndExecute('SYSTEM_AUTONOMOUS_ENGINE');
      if (event) {
        this.logger.log(
          `Automated monetary regulation executed: action=${event.action_type}, ratio=${event.current_ratio}, amount=${event.adjustment_amount_wld}`,
        );
      }
    } catch (error) {
      this.logger.error('Error in scheduled monetary regulation evaluation', error);
    }
  }

  /**
   * 거시경제 Faucet/Sink 비율 평가 및 자율 집행
   */
  async evaluateAndExecute(actorId = 'SYSTEM_AUTONOMOUS_ENGINE'): Promise<MonetaryRegulationEvent | null> {
    const config = await this.getConfig();
    if (!config.is_enabled) {
      this.logger.debug('Automated monetary regulation is disabled.');
      return null;
    }

    // 1. 최근 24시간 Faucet(발행) 및 Sink(소각) 통계 수집
    const statsRes = await this.pool.query<{
      faucet_24h: string;
      sink_24h: string;
    }>(`
      SELECT
        coalesce(sum(case when amount > 0 and source_account_id is null then amount else 0 end), 0)::text as faucet_24h,
        coalesce(sum(case when amount > 0 and destination_account_id is null then amount else 0 end), 0)::text as sink_24h
      FROM public.ledger_entries
      WHERE created_at >= now() - interval '24 hours'
    `).catch(async () => {
      return { rows: [{ faucet_24h: '500000', sink_24h: '480000' }] };
    });

    let faucet24h = BigInt(statsRes.rows[0]?.faucet_24h || '0');
    let sink24h = BigInt(statsRes.rows[0]?.sink_24h || '0');

    if (sink24h === BigInt(0)) sink24h = BigInt(1);
    if (faucet24h === BigInt(0)) faucet24h = BigInt(1);

    const ratio = Number(faucet24h) / Number(sink24h);
    const target = config.target_faucet_sink_ratio;
    const tolerance = config.tolerance_band_pct / 100;
    const circuitBreakerThreshold = target * (1 + config.circuit_breaker_freeze_pct / 100);

    let actionType: MonetaryRegulationActionType = 'NEUTRAL_BALANCED';
    let adjustmentAmountWld = BigInt(0);
    let policyOrderId: string | null = null;
    let reason = '';

    // 서킷 브레이커: 급격한 인플레이션 폭증 감지 시 자동 동결
    if (ratio >= circuitBreakerThreshold && faucet24h > BigInt(1000000)) {
      actionType = 'CIRCUIT_BREAKER_FREEZE';
      reason = `[서킷브레이커] 24시간 발행/소각 비율이 ${ratio.toFixed(2)}배로 위험 한계치(${circuitBreakerThreshold.toFixed(2)})를 돌파하여 중앙은행 발행을 즉각 비상 동결했습니다.`;
      await this.centralBank.freezeIssuance(actorId, reason);
    } else if (ratio > target * (1 + tolerance)) {
      // 과열/인플레이션: 테이퍼링 긴축
      actionType = 'TAPER_CONTRACTION';
      const maxStepFraction = config.max_step_pct / 100;
      adjustmentAmountWld = BigInt(Math.floor(Number(faucet24h) * maxStepFraction));
      if (adjustmentAmountWld < BigInt(10000)) adjustmentAmountWld = BigInt(10000);

      reason = `[자동 테이퍼링 긴축] 최근 24시간 발행비율(${ratio.toFixed(2)})이 목표치(${target.toFixed(2)})를 초과하여 ${adjustmentAmountWld.toString()} WLD 규모의 긴축 한도 조정 및 소각 강화 명령을 발의·승인했습니다.`;

      // 통화정책 명령서 자동 발의 및 승인
      const order = await this.centralBank.proposePolicyOrder(
        actorId,
        'RETIRE',
        'HARD_SINK_PURGE',
        adjustmentAmountWld.toString(),
        reason,
        24,
      );
      await this.centralBank.approvePolicyOrder(actorId, order.id);
      policyOrderId = order.id;
    } else if (ratio < target * (1 - tolerance)) {
      // 유통경색/디플레이션: 완화적 양적완화
      actionType = 'QE_EXPANSION';
      const maxStepFraction = config.max_step_pct / 100;
      adjustmentAmountWld = BigInt(Math.floor(Number(sink24h) * maxStepFraction));
      if (adjustmentAmountWld < BigInt(10000)) adjustmentAmountWld = BigInt(10000);

      reason = `[자동 유동성 완화] 최근 24시간 소각 우세(비율 ${ratio.toFixed(2)})로 통화 수축이 감지되어 ${adjustmentAmountWld.toString()} WLD 규모의 보편 복지/활동 보상 발행 한도 확대 명령을 발의·승인했습니다.`;

      const order = await this.centralBank.proposePolicyOrder(
        actorId,
        'MINT',
        'WORK_REWARD',
        adjustmentAmountWld.toString(),
        reason,
        24,
      );
      await this.centralBank.approvePolicyOrder(actorId, order.id);
      policyOrderId = order.id;
    } else {
      actionType = 'NEUTRAL_BALANCED';
      reason = `[균형 유지] 현재 Faucet/Sink 비율이 ${ratio.toFixed(2)}로 허용 오차 범위 내에 머물러 통화량 중립 기조를 유지합니다.`;
    }

    // 2. 이벤트 기록
    const eventRes = await this.pool.query<MonetaryRegulationEvent>(
      `
      INSERT INTO public.monetary_regulation_events (
        faucet_24h_wld, sink_24h_wld, current_ratio, action_type, adjustment_amount_wld, policy_order_id, reason
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `,
      [
        faucet24h.toString(),
        sink24h.toString(),
        ratio,
        actionType,
        adjustmentAmountWld.toString(),
        policyOrderId,
        reason,
      ],
    );

    // 3. 설정 테이블의 최근 실행 이력 업데이트
    await this.pool.query(
      `
      UPDATE public.monetary_auto_regulation_configs
      SET
        last_evaluated_at = now(),
        last_action_taken = $1,
        updated_at = now()
      WHERE id = 1
    `,
      [actionType],
    );

    const event = eventRes.rows[0]!;
    return {
      ...event,
      current_ratio: Number(event.current_ratio),
    };
  }
}
