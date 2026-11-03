import { BadRequestException, ForbiddenException, Inject, Injectable, ServiceUnavailableException } from '@nestjs/common';
import type { Queryable } from '../../core/db';
import { PG_POOL } from '../../core/pool.provider';
import type { MintCertificate, MonetaryPolicyOrder, RetirementCertificate } from './monetary.types';

@Injectable()
export class MintBureauService {
  constructor(@Inject(PG_POOL) private readonly pool: Queryable) {}

  /** No certificate is money until the DB-owned command posts a balanced journal. */
  async executeAuthorizedMint(
    actorId: string,
    policyOrderId: string,
    amountWld: string,
    recipientUserId: string | null,
    idempotencyKey: string,
  ): Promise<MintCertificate> {
    const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (![actorId, policyOrderId, recipientUserId, idempotencyKey].every(
      (value) => typeof value === 'string' && uuid.test(value),
    ) || !/^[1-9][0-9]{0,79}$/.test(amountWld)) {
      throw new BadRequestException('Canonical Mint requires actor, approved order, recipient, UUIDv4 key and exact positive WLD');
    }
    let certificate: MintCertificate | undefined;
    try {
      const result = await this.pool.query<MintCertificate>(
        'SELECT * FROM public.monetary_execute_canonical_mint($1::uuid,$2::uuid,$3::text,$4::uuid,$5::uuid)',
        [actorId, policyOrderId, amountWld, recipientUserId, idempotencyKey],
      );
      certificate = result.rows[0];
    } catch (err) {
      const pg = err as { code?: string };
      if (pg.code === '42501') throw new ForbiddenException('Canonical Mint approval required');
      if (pg.code === '22023' || pg.code === '23505') {
        throw new BadRequestException('Canonical Mint order, balance or replay parameters rejected');
      }
      throw new ServiceUnavailableException('Canonical Mint posting unavailable');
    }
    if (!certificate || certificate.actor_id !== actorId
      || certificate.policy_order_id !== policyOrderId
      || certificate.recipient_user_id !== recipientUserId
      || certificate.idempotency_key !== idempotencyKey
      || certificate.amount_wld !== amountWld
      || !uuid.test(certificate.id)
      || typeof certificate.ledger_transaction_id !== 'string'
      || !uuid.test(certificate.ledger_transaction_id)
      || !/^[0-9a-f]{64}$/.test(certificate.evidence_digest ?? '')
      || typeof certificate.replayed !== 'boolean') {
      throw new ServiceUnavailableException('Canonical Mint ledger-linked receipt missing or inconsistent');
    }
    return certificate;
  }

  async retireAuthorizedAmount(
    _actorId: string, _policyOrderId: string | null, _amountWld: string,
    _sourceType: string, _reason: string, _idempotencyKey: string,
  ): Promise<RetirementCertificate> {
    // The old policy-only path wrote certificates without debiting a proven WLD source.
    throw new ForbiddenException('Canonical funded retirement command not yet available');
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
