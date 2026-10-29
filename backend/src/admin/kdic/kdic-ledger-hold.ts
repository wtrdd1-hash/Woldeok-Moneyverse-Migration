import { ServiceUnavailableException } from '@nestjs/common';

/**
 * The legacy KDIC writers mutate insurance-fund tables directly and have not
 * been certified against an isolated, ledger-reconciled, idempotent settlement
 * contract. UI-only disablement cannot secure a callable NestJS endpoint.
 *
 * Deliberately unconditional: no environment flag or admin role bypasses this
 * hold. Replace only alongside a verified SECURITY DEFINER ledger transaction,
 * audit receipt, isolated PostgreSQL tests and an approved release gate.
 */
export function rejectUnverifiedKdicSettlement(): never {
  throw new ServiceUnavailableException({
    code: 'KDIC_LEDGER_SETTLEMENT_UNVERIFIED',
    message: 'KDIC financial settlement is suspended pending verified ledger and authorization controls',
  });
}
