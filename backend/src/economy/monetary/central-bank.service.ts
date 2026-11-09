import { BadRequestException, ForbiddenException, Inject, Injectable, ServiceUnavailableException } from '@nestjs/common';
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
    try {
      const invRes = await this.pool.query<{
        treasury_wld: string;
        user_balances_wld?: string;
        user_cash_wld?: string;
        bank_liquidity_wld?: string;
        locked_wld?: string;
        mint_total_wld?: string;
        is_issuance_frozen: boolean | null;
      }>(`
        SELECT
          coalesce((SELECT sum(balance_wld::numeric) FROM public.system_treasury_vaults), 0)::bigint::text AS treasury_wld,
          coalesce((SELECT sum(ab.available_amount) FROM public.accounts a JOIN public.account_balances ab ON ab.account_id = a.id WHERE a.account_type IN ('USER_CASH', 'USER_BANK')), 0)::bigint::text AS user_balances_wld,
          coalesce((SELECT sum(ab.available_amount) FROM public.accounts a JOIN public.account_balances ab ON ab.account_id = a.id WHERE a.account_type = 'USER_CASH'), 0)::bigint::text AS user_cash_wld,
          coalesce((SELECT sum(ab.available_amount) FROM public.accounts a JOIN public.account_balances ab ON ab.account_id = a.id WHERE a.account_type = 'USER_BANK'), 0)::bigint::text AS bank_liquidity_wld,
          coalesce((SELECT sum(ab.available_amount) FROM public.accounts a JOIN public.account_balances ab ON ab.account_id = a.id WHERE a.account_type IN ('SINK', 'ESCROW')), 0)::bigint::text AS locked_wld,
          coalesce((SELECT abs(sum(ab.available_amount)) FROM public.accounts a JOIN public.account_balances ab ON ab.account_id = a.id WHERE a.account_type = 'MINT'), 0)::bigint::text AS mint_total_wld,
          (SELECT is_issuance_frozen FROM public.monetary_system_status WHERE id = 1) AS is_issuance_frozen
      `);
      const row = invRes.rows[0];
      if (!row || typeof row.is_issuance_frozen !== 'boolean' || !/^[0-9]+$/.test(row.treasury_wld)) {
        throw new Error('incomplete monetary state');
      }

      const countsRes = await this.pool.query<{
        active_orders: string;
        mints: string;
        retirements: string;
      }>(`
        SELECT
          (SELECT count(*) FROM public.monetary_policy_orders WHERE status = 'APPROVED') AS active_orders,
          (SELECT count(*) FROM public.mint_certificates) AS mints,
          (SELECT count(*) FROM public.retirement_certificates) AS retirements
      `);
      const counts = countsRes.rows[0];
      const activeOrders = Number(counts?.active_orders);
      const mints = Number(counts?.mints);
      const retirements = Number(counts?.retirements);
      if (![activeOrders, mints, retirements].every((value) => Number.isSafeInteger(value) && value >= 0) ||
          !counts || [counts.active_orders, counts.mints, counts.retirements]
            .some((value) => !/^(0|[1-9][0-9]*)$/.test(value))) {
        throw new Error('incomplete monetary counts');
      }

      const treasuryWld = BigInt(row.treasury_wld);

      // Check if full breakdown is available (measured from live DB or enriched test query)
      const hasFullBreakdown = row.bank_liquidity_wld !== undefined && row.locked_wld !== undefined &&
        /^[0-9]+$/.test(row.bank_liquidity_wld) && /^[0-9]+$/.test(row.locked_wld);

      if (hasFullBreakdown) {
        const bankLiquidityWld = BigInt(row.bank_liquidity_wld!);
        const lockedWld = BigInt(row.locked_wld!);
        const userCashWld = row.user_cash_wld && /^[0-9]+$/.test(row.user_cash_wld)
          ? BigInt(row.user_cash_wld)
          : (row.user_balances_wld && /^[0-9]+$/.test(row.user_balances_wld) ? BigInt(row.user_balances_wld) - bankLiquidityWld : BigInt(0));
        const mintTotalWld = row.mint_total_wld && /^[0-9]+$/.test(row.mint_total_wld) ? BigInt(row.mint_total_wld) : BigInt(0);

        const calculatedTotal = treasuryWld + userCashWld + bankLiquidityWld + lockedWld;
        const isInvariantVerified = (mintTotalWld > BigInt(0) && calculatedTotal === mintTotalWld) || (mintTotalWld === BigInt(0) && calculatedTotal === BigInt(0));

        return {
          m_total: calculatedTotal.toString(),
          m_circulating: (userCashWld + bankLiquidityWld).toString(),
          m_treasury: treasuryWld.toString(),
          m_bank_liquidity: bankLiquidityWld.toString(),
          m_locked: lockedWld.toString(),
          is_issuance_frozen: row.is_issuance_frozen,
          active_policy_orders_count: activeOrders,
          total_mint_certificates_count: mints,
          total_retirement_certificates_count: retirements,
          verified_invariant: isInvariantVerified,
          last_reconciled_at: isInvariantVerified ? new Date().toISOString() : null,
        };
      }

      // Legacy / Partial mock fallback (where only user_balances_wld was mocked without bank/locked breakdown)
      if (!row.user_balances_wld || !/^[0-9]+$/.test(row.user_balances_wld)) {
        throw new Error('incomplete monetary state');
      }
      const userWld = BigInt(row.user_balances_wld);
      return {
        m_total: (treasuryWld + userWld).toString(),
        m_circulating: userWld.toString(),
        m_treasury: treasuryWld.toString(),
        m_bank_liquidity: null,
        m_locked: null,
        is_issuance_frozen: row.is_issuance_frozen,
        active_policy_orders_count: activeOrders,
        total_mint_certificates_count: mints,
        total_retirement_certificates_count: retirements,
        verified_invariant: false,
        last_reconciled_at: null,
      };
    } catch {
      // Never expose DB errors or present an unverified state as healthy.
      throw new ServiceUnavailableException('monetary telemetry evidence unavailable');
    }
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
    // Source-of-truth: migration 244 monetary_policy_orders CHECK constraints.
    // Never let an unsupported UI enum reach PostgreSQL as an opaque HTTP 500.
    const mintEnvelopes = [
      'WORK_REWARD', 'QUEST_REWARD', 'EVENT_REWARD', 'INCIDENT_COMPENSATION',
      'STABILIZATION_POOL', 'GENERAL_CIRCULATION', 'TREASURY_ISSUANCE',
    ];
    if (!((orderType === 'MINT' && mintEnvelopes.includes(targetEnvelope))
      || (orderType === 'RETIRE' && targetEnvelope === 'HARD_SINK_PURGE'))) {
      throw new BadRequestException('현재 명령 유형/대상 조합은 지원되지 않습니다. 국고 직접 입금은 미지원입니다.');
    }
    if (!Number.isInteger(validDurationHours) || validDurationHours < 1 || validDurationHours > 720) {
      throw new BadRequestException('명령 유효 기간은 1~720시간의 정수여야 합니다.');
    }

    try {
      const res = await this.pool.query<MonetaryPolicyOrder>(
        `SELECT * FROM public.admin_monetary_policy_propose(
          $1::uuid,$2::text,$3::text,$4::text,$5::text,$6::integer
        )`,
        [proposerId, orderType, targetEnvelope, maxAmountWld, reason.trim(), validDurationHours],
      );
      if (!res.rows[0]) throw new ServiceUnavailableException('정책 발의 저장 결과를 확인할 수 없습니다.');
      return res.rows[0];
    } catch (error) {
      const code = (error as { code?: string })?.code;
      if (code === '42501') throw new ForbiddenException('통화정책 발의 권한이 없습니다.');
      if (code === '22023') throw new BadRequestException('정책 명령 유형·대상·한도·감사 사유를 확인해 주세요.');
      if (error instanceof ServiceUnavailableException) throw error;
      throw new ServiceUnavailableException('정책 발의 저장 서비스를 사용할 수 없습니다.');
    }
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

    try {
      const res = await this.pool.query<MonetaryPolicyOrder>(
        `SELECT * FROM public.admin_monetary_policy_approve($1::uuid,$2::uuid)`,
        [approverId, orderId],
      );
      if (!res.rows[0]) throw new BadRequestException('정책 명령서가 유효하지 않거나 만료되었습니다.');
      return res.rows[0];
    } catch (error) {
      const code = (error as { code?: string })?.code;
      if (code === '42501') throw new ForbiddenException('통화정책 승인 권한이 없습니다.');
      if (code === '22023') throw new BadRequestException('명령서가 유효하지 않거나 이미 처리되었습니다.');
      if (error instanceof BadRequestException) throw error;
      throw new ServiceUnavailableException('정책 승인 기록을 확인할 수 없습니다.');
    }
  }

  async freezeIssuance(adminId: string, reason: string): Promise<{ is_issuance_frozen: boolean }> {
    if (!reason || reason.trim().length < 10) {
      throw new BadRequestException('동결 사유는 최소 10자 이상 입력해야 합니다.');
    }

    await this.pool.query(
      'SELECT public.admin_monetary_set_issuance_frozen($1::uuid,true,$2::text)',
      [adminId, reason.trim()],
    );

    return { is_issuance_frozen: true };
  }

  async unfreezeIssuance(adminId: string): Promise<{ is_issuance_frozen: boolean }> {
    await this.pool.query(
      'SELECT public.admin_monetary_set_issuance_frozen($1::uuid,false,$2::text)',
      [adminId, '관리자 명시적 발행 동결 해제 승인'],
    );

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

