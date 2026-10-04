import { BadRequestException, ForbiddenException, Inject, Injectable } from '@nestjs/common';
import type { Queryable } from '../../core/db';
import { PG_POOL } from '../../core/pool.provider';
import type { MintCertificate, MonetaryPolicyOrder, RetirementCertificate } from './monetary.types';

@Injectable()
export class MintBureauService {
  constructor(@Inject(PG_POOL) private readonly pool: Queryable) {}

  async executeAuthorizedMint(
    actorId: string,
    policyOrderId: string,
    amountWld: string,
    recipientUserId: string | null,
    idempotencyKey: string,
  ): Promise<MintCertificate> {
    if (!amountWld || !/^\d+$/.test(amountWld) || BigInt(amountWld) <= BigInt(0)) {
      throw new BadRequestException('발행 수량은 1 WLD 이상의 정수여야 합니다.');
    }
    if (!idempotencyKey || idempotencyKey.trim().length === 0) {
      throw new BadRequestException('멱등성 키(idempotencyKey)는 필수입니다.');
    }

    // 1. Check Issuance Frozen
    const statusRes = await this.pool.query<{ is_issuance_frozen: boolean }>(
      `SELECT is_issuance_frozen FROM public.monetary_system_status WHERE id = 1`,
    );
    if (statusRes.rows[0]?.is_issuance_frozen) {
      throw new ForbiddenException('중앙은행에 의해 통화 발행이 긴급 동결된 상태입니다.');
    }

    // 2. Fetch Policy Order and Lock row
    const orderRes = await this.pool.query<MonetaryPolicyOrder>(
      `SELECT * FROM public.monetary_policy_orders WHERE id = $1 FOR UPDATE`,
      [policyOrderId],
    );
    const order = orderRes.rows[0];
    if (!order) {
      throw new BadRequestException('지정된 통화정책 명령서를 찾을 수 없습니다.');
    }
    if (order.status !== 'APPROVED') {
      throw new ForbiddenException(`통화정책 명령서가 승인(APPROVED) 상태가 아닙니다 (현재: ${order.status}).`);
    }
    if (new Date(order.expires_at).getTime() < Date.now()) {
      throw new ForbiddenException('해당 통화정책 명령서의 유효기간이 만료되었습니다.');
    }

    const maxAmt = BigInt(order.max_amount_wld);
    const executedAmt = BigInt(order.executed_amount_wld);
    const reqAmt = BigInt(amountWld);

    if (executedAmt + reqAmt > maxAmt) {
      throw new ForbiddenException(
        `발행 한도 초과: 잔여 한도는 ${(maxAmt - executedAmt).toString()} WLD이나 ${amountWld} WLD 발행을 시도했습니다.`,
      );
    }

    // 3. Atomically Record Mint Certificate and Update Policy Order
    const certRes = await this.pool.query<MintCertificate>(
      `
      INSERT INTO public.mint_certificates (
        policy_order_id, amount_wld, source_envelope, recipient_user_id, idempotency_key, actor_id
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `,
      [policyOrderId, amountWld, order.target_envelope, recipientUserId, idempotencyKey, actorId],
    );

    const newExecuted = (executedAmt + reqAmt).toString();
    const isFullyExecuted = executedAmt + reqAmt === maxAmt;

    await this.pool.query(
      `
      UPDATE public.monetary_policy_orders
      SET executed_amount_wld = $1, status = $2, updated_at = NOW()
      WHERE id = $3
    `,
      [newExecuted, isFullyExecuted ? 'EXECUTED' : 'APPROVED', policyOrderId],
    );

    return certRes.rows[0]!;
  }

  async retireAuthorizedAmount(
    actorId: string,
    policyOrderId: string | null,
    amountWld: string,
    sourceType: string,
    reason: string,
    idempotencyKey: string,
  ): Promise<RetirementCertificate> {
    if (!amountWld || !/^\d+$/.test(amountWld) || BigInt(amountWld) <= BigInt(0)) {
      throw new BadRequestException('소각/폐기 수량은 1 WLD 이상의 정수여야 합니다.');
    }
    if (!reason || reason.trim().length < 5) {
      throw new BadRequestException('소각 감사 사유는 최소 5자 이상 필요합니다.');
    }
    if (!idempotencyKey || idempotencyKey.trim().length === 0) {
      throw new BadRequestException('멱등성 키는 필수입니다.');
    }

    const certRes = await this.pool.query<RetirementCertificate>(
      `
      INSERT INTO public.retirement_certificates (
        policy_order_id, amount_wld, source_type, actor_id, reason, idempotency_key
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `,
      [policyOrderId, amountWld, sourceType, actorId, reason, idempotencyKey],
    );

    return certRes.rows[0]!;
  }

  async listMintCertificates(limit = 20): Promise<MintCertificate[]> {
    const res = await this.pool.query<MintCertificate>(
      `SELECT * FROM public.mint_certificates ORDER BY created_at DESC LIMIT $1`,
      [Math.max(1, Math.min(limit, 50))],
    );
    return res.rows;
  }

  async listRetirementCertificates(limit = 20): Promise<RetirementCertificate[]> {
    const res = await this.pool.query<RetirementCertificate>(
      `SELECT * FROM public.retirement_certificates ORDER BY created_at DESC LIMIT $1`,
      [Math.max(1, Math.min(limit, 50))],
    );
    return res.rows;
  }
}
