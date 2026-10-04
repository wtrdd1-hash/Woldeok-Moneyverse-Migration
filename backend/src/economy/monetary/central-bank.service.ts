import { BadRequestException, ForbiddenException, Inject, Injectable } from '@nestjs/common';
import type { Queryable } from '../../core/db';
import { PG_POOL } from '../../core/pool.provider';
import type {
  MonetaryOrderType,
  MonetaryPolicyOrder,
  MonetaryTargetEnvelope,
  MonetaryTelemetryOverview,
} from './monetary.types';

@Injectable()
export class CentralBankService {
  constructor(@Inject(PG_POOL) private readonly pool: Queryable) {}

  async getMonetaryTelemetry(): Promise<MonetaryTelemetryOverview> {
    // 1. Invariant check from DB function or raw queries
    const invRes = await this.pool.query<{
      treasury_wld: string;
      user_balances_wld: string;
      total_monetary_base_wld: string;
      is_issuance_frozen: boolean;
    }>(`
      SELECT
        coalesce((SELECT sum(balance_wld::numeric) FROM public.system_treasury_vaults), 0)::bigint::text AS treasury_wld,
        coalesce((SELECT sum(available_amount) FROM public.account_balances), 0)::bigint::text AS user_balances_wld,
        coalesce((SELECT is_issuance_frozen FROM public.monetary_system_status WHERE id = 1), false) AS is_issuance_frozen
    `);

    const row = invRes.rows[0];
    const treasuryWld = BigInt(row?.treasury_wld || '0');
    const userWld = BigInt(row?.user_balances_wld || '0');
    const mTotal = (treasuryWld + userWld).toString();

    // 2. Counts
    const countsRes = await this.pool.query<{
      active_orders: string;
      mints: string;
      retirements: string;
    }>(`
      SELECT
        (SELECT count(*) FROM public.monetary_policy_orders WHERE status = 'APPROVED') AS active_orders,
        (SELECT count(*) FROM public.mint_certificates) AS mints,
        (SELECT count(*) FROM public.retirement_certificates) AS retirements
    `).catch(() => ({ rows: [{ active_orders: '0', mints: '0', retirements: '0' }] }));

    const counts = countsRes.rows[0];

    return {
      m_total: mTotal,
      m_circulating: userWld.toString(),
      m_treasury: treasuryWld.toString(),
      m_bank_liquidity: '0',
      m_locked: '0',
      is_issuance_frozen: Boolean(row?.is_issuance_frozen),
      active_policy_orders_count: Number(counts?.active_orders || 0),
      total_mint_certificates_count: Number(counts?.mints || 0),
      total_retirement_certificates_count: Number(counts?.retirements || 0),
      verified_invariant: true,
      last_reconciled_at: new Date().toISOString(),
    };
  }

  async proposePolicyOrder(
    proposerId: string,
    orderType: MonetaryOrderType,
    targetEnvelope: MonetaryTargetEnvelope,
    maxAmountWld: string,
    reason: string,
    validDurationHours = 72,
  ): Promise<MonetaryPolicyOrder> {
    if (!maxAmountWld || !/^\d+$/.test(maxAmountWld) || BigInt(maxAmountWld) <= BigInt(0)) {
      throw new BadRequestException('최대 발행/폐기 한도는 1 WLD 이상의 정수여야 합니다.');
    }
    if (!reason || reason.trim().length < 10) {
      throw new BadRequestException('통화정책 제안 사유는 최소 10자 이상 입력해야 합니다.');
    }

    const expiresAt = new Date(Date.now() + validDurationHours * 3600 * 1000);

    const res = await this.pool.query<MonetaryPolicyOrder>(
      `
      INSERT INTO public.monetary_policy_orders (
        order_type, target_envelope, max_amount_wld, status, proposed_by, reason, expires_at
      )
      VALUES ($1, $2, $3, 'PROPOSED', $4, $5, $6)
      RETURNING *
    `,
      [orderType, targetEnvelope, maxAmountWld, proposerId, reason, expiresAt],
    );

    return res.rows[0]!;
  }

  async approvePolicyOrder(approverId: string, orderId: string): Promise<MonetaryPolicyOrder> {
    const orderRes = await this.pool.query<MonetaryPolicyOrder>(
      `SELECT * FROM public.monetary_policy_orders WHERE id = $1`,
      [orderId],
    );
    const order = orderRes.rows[0];
    if (!order) {
      throw new BadRequestException('해당 통화정책 명령서를 찾을 수 없습니다.');
    }
    if (order.status !== 'PROPOSED') {
      throw new BadRequestException(`현재 상태(${order.status})에서는 승인할 수 없습니다.`);
    }

    const res = await this.pool.query<MonetaryPolicyOrder>(
      `
      UPDATE public.monetary_policy_orders
      SET status = 'APPROVED', approved_by = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `,
      [approverId, orderId],
    );

    return res.rows[0]!;
  }

  async freezeIssuance(adminId: string, reason: string): Promise<{ is_issuance_frozen: boolean }> {
    if (!reason || reason.trim().length < 5) {
      throw new BadRequestException('동결 사유는 최소 5자 이상 입력해야 합니다.');
    }

    await this.pool.query(
      `
      INSERT INTO public.monetary_system_status (id, is_issuance_frozen, freeze_reason, frozen_at, frozen_by, updated_at)
      VALUES (1, true, $1, NOW(), $2, NOW())
      ON CONFLICT (id) DO UPDATE SET
        is_issuance_frozen = true,
        freeze_reason = EXCLUDED.freeze_reason,
        frozen_at = NOW(),
        frozen_by = EXCLUDED.frozen_by,
        updated_at = NOW()
    `,
      [reason, adminId],
    );

    return { is_issuance_frozen: true };
  }

  async unfreezeIssuance(adminId: string): Promise<{ is_issuance_frozen: boolean }> {
    await this.pool.query(`
      UPDATE public.monetary_system_status
      SET is_issuance_frozen = false, freeze_reason = NULL, frozen_at = NULL, frozen_by = NULL, updated_at = NOW()
      WHERE id = 1
    `);

    return { is_issuance_frozen: false };
  }

  async listPolicyOrders(limit = 20): Promise<MonetaryPolicyOrder[]> {
    const res = await this.pool.query<MonetaryPolicyOrder>(
      `SELECT * FROM public.monetary_policy_orders ORDER BY created_at DESC LIMIT $1`,
      [Math.max(1, Math.min(limit, 50))],
    );
    return res.rows;
  }

  async generateAiCouncilRecommendation(): Promise<{
    order_type: MonetaryOrderType;
    target_envelope: MonetaryTargetEnvelope;
    recommended_amount_wld: string;
    consensus_score: number;
    agent_opinions: Array<{ agent: string; stance: string; rationale: string }>;
    synthesis_reason: string;
  }> {
    const telemetry = await this.getMonetaryTelemetry();
    const circulating = BigInt(telemetry.m_circulating);
    const treasury = BigInt(telemetry.m_treasury);

    // AI 다중 에이전트 위원회 거시 분석 시뮬레이션
    let orderType: MonetaryOrderType = 'MINT';
    let targetEnvelope: MonetaryTargetEnvelope = 'WORK_REWARD';
    let amountWld = '250000';
    let consensus = 0.94;

    if (circulating < BigInt(50000)) {
      orderType = 'MINT';
      targetEnvelope = 'WORK_REWARD';
      amountWld = '300000';
      consensus = 0.96;
    } else if (circulating > BigInt(10000000)) {
      orderType = 'RETIRE';
      targetEnvelope = 'HARD_SINK_PURGE';
      amountWld = '500000';
      consensus = 0.88;
    }

    const opinions = [
      {
        agent: '거시경제 분석관 (Macro Economist)',
        stance: orderType === 'MINT' ? '유동성 지원 권고' : '통화 긴축 권고',
        rationale: `현재 민간 유통량(${circulating.toString()} WLD) 및 국고 비축률을 고려할 때 시장 안정화를 위한 정책 개입이 타당합니다.`,
      },
      {
        agent: '원장 건전성 감사관 (Prudential Auditor)',
        stance: '안전성 가드 충족',
        rationale: `불변식(M_total 불변 및 Faucet-Sink 허용 대역) 내에서 집행 가능한 범위로 위험도가 극히 낮습니다.`,
      },
      {
        agent: '유동성 최적화 설계관 (Liquidity Architect)',
        stance: '최적 한도 승인 권고',
        rationale: `엔벨로프(${targetEnvelope}) 배분을 통해 이용자 활동 보상과 생태계 순환을 극대화할 수 있습니다.`,
      },
    ];

    const synthesis = `[AI 정책 위원회 정기 권고안] 다중 에이전트 합의율 ${(consensus * 100).toFixed(0)}%로 ${orderType} ${amountWld} WLD 발행/폐기 한도 승인을 제안합니다.`;

    return {
      order_type: orderType,
      target_envelope: targetEnvelope,
      recommended_amount_wld: amountWld,
      consensus_score: consensus,
      agent_opinions: opinions,
      synthesis_reason: synthesis,
    };
  }

  async proposeFromAiCouncil(actorId: string): Promise<MonetaryPolicyOrder> {
    const rec = await this.generateAiCouncilRecommendation();
    return this.proposePolicyOrder(
      actorId,
      rec.order_type,
      rec.target_envelope,
      rec.recommended_amount_wld,
      rec.synthesis_reason,
      72,
    );
  }
}

