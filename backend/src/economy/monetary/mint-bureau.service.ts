import { BadRequestException, ConflictException, ForbiddenException, Inject, Injectable, ServiceUnavailableException } from '@nestjs/common';
import type { Queryable } from '../../core/db';
import { PG_POOL } from '../../core/pool.provider';
import type { MintCertificate, RetirementCertificate } from './monetary.types';

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

    // Migration 344: DB-owned role checks, idempotency and atomic policy
    // capacity reservation + certificate insertion. The old app-role INSERT
    // was denied in Production, so its direct CTE returned HTTP 500.
    // This is certificate bookkeeping ONLY; no canonical WLD/VAULT transfer.
    try {
      const result = await this.pool.query<MintCertificate>(
        `SELECT * FROM public.admin_monetary_mint_certificate(
           $1::uuid,$2::uuid,$3::text,$4::uuid,$5::text
         )`,
        [actorId, policyOrderId, amountWld, recipientUserId, idempotencyKey],
      );
      if (!result.rows[0]) {
        throw new ForbiddenException('승인된 명령서가 없거나 한도·유효 기간을 확인해야 합니다.');
      }
      return result.rows[0];
    } catch (error) {
      const code = (error as { code?: string })?.code;
      if (code === '42501') throw new ForbiddenException('화폐 정책 집행 권한이 없습니다.');
      if (code === '22023') throw new BadRequestException('승인 명령 상태·유효 기간·한도 및 요청값을 확인해 주세요.');
      if (code === '23505') throw new ConflictException('이미 다른 주조 인증서 기록에 사용된 중복 요청입니다.');
      if (code === '55000') throw new ServiceUnavailableException('정본 금융 원장으로 입증되지 않는 주조 대상은 사용할 수 없습니다.');
      if (error instanceof ForbiddenException) throw error;
      throw new ServiceUnavailableException('주조 인증서 기록을 처리할 수 없습니다.');
    }
  }

  /** Dedicated canonical WLD mint to Treasury, not a certificate-only write. */
  async executeTreasuryMint(
    actorId: string,
    policyOrderId: string,
    amountWld: string,
    requestKey: string,
  ): Promise<{
    success: true;
    code: 'TREASURY_MINT_SETTLED';
    amount_wld: string;
    ledger_transaction_id: string;
    mint_certificate_id: string;
    vault_after_wld: string;
  }> {
    const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuid.test(requestKey) || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(policyOrderId)
      || typeof amountWld !== 'string' || !/^[1-9][0-9]{0,7}$/.test(amountWld)
      || BigInt(amountWld) > 10000000n) {
      throw new BadRequestException('국고 발행: 유효한 승인 명령서, 1~10,000,000 WLD, UUID 요청 키가 필요합니다.');
    }
    try {
      const result = await this.pool.query<{ receipt: {
        success: true;
        code: 'TREASURY_MINT_SETTLED';
        amount_wld: string;
        ledger_transaction_id: string;
        mint_certificate_id: string;
        vault_after_wld: string;
      } }>(
        'SELECT public.admin_monetary_mint_to_treasury($1::uuid,$2::uuid,$3::text,$4::uuid) AS receipt',
        [actorId, policyOrderId, amountWld, requestKey],
      );
      const receipt = result.rows[0]?.receipt;
      if (!receipt || receipt.success !== true || receipt.code !== 'TREASURY_MINT_SETTLED'
        || receipt.amount_wld !== amountWld || typeof receipt.ledger_transaction_id !== 'string'
        || typeof receipt.mint_certificate_id !== 'string' || !/^(0|[1-9][0-9]*)$/.test(receipt.vault_after_wld)) {
        throw new ServiceUnavailableException('정본 국고 발행 영수증이 검증되지 않았습니다.');
      }
      return receipt;
    } catch (error) {
      const code = (error as { code?: string })?.code;
      if (code === '42501') throw new ForbiddenException('국고 신규 발행에 대한 관리자 권한이 없습니다.');
      if (code === '22023') throw new BadRequestException('승인된 국고 발행 정책·발행 한도·유효기간을 확인해 주세요.');
      if (code === '23505') throw new ConflictException('이미 다른 국고 발행에 사용된 중복 요청 키입니다.');
      if (code === '55000' || code === '23514') throw new ServiceUnavailableException('화폐 발행이 동결되었거나 국고 정본 증빙이 일치하지 않아 집행할 수 없습니다.');
      if (error instanceof ServiceUnavailableException) throw error;
      throw new ServiceUnavailableException('국고 정본 발행을 검증할 수 없습니다.');
    }
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

    if (policyOrderId !== null) {
      // A linked retirement must have an unexpired approved RETIRE order.
      // The conditional update and certificate insert execute atomically.
      const guarded = await this.pool.query<RetirementCertificate>(
        `WITH authorized AS (
          UPDATE public.monetary_policy_orders
             SET executed_amount_wld = (executed_amount_wld::numeric + $2::numeric)::text,
                 status = CASE WHEN executed_amount_wld::numeric + $2::numeric = max_amount_wld::numeric
                               THEN 'EXECUTED' ELSE 'APPROVED' END,
                 updated_at = clock_timestamp()
           WHERE id = $1::uuid AND order_type = 'RETIRE' AND status = 'APPROVED'
             AND expires_at > clock_timestamp()
             AND executed_amount_wld::numeric + $2::numeric <= max_amount_wld::numeric
           RETURNING id
        )
        INSERT INTO public.retirement_certificates
          (policy_order_id, amount_wld, source_type, actor_id, reason, idempotency_key)
        SELECT id, $2, $3, $4, $5, $6 FROM authorized
        RETURNING *`,
        [policyOrderId, amountWld, sourceType, actorId, reason, idempotencyKey],
      );
      if (!guarded.rows[0]) {
        throw new ForbiddenException('Retirement policy is cancelled, expired, or out of funds');
      }
      return guarded.rows[0];
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
