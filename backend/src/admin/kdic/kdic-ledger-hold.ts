import { ServiceUnavailableException } from '@nestjs/common';

/**
 * The legacy KDIC writers mutate insurance-fund tables directly and have not
 * been certified against an isolated, ledger-reconciled, idempotent settlement
 * contract. UI-only disablement cannot secure a callable NestJS endpoint.
 *
 * Controlled by MONEYVERSE_KDIC_LEDGER_OPERATIONAL flag for production operations.
 */
export function rejectUnverifiedKdicSettlement(): void {
  if (process.env.MONEYVERSE_KDIC_LEDGER_OPERATIONAL === 'true') {
    return;
  }
  throw new ServiceUnavailableException({
    code: 'KDIC_LEDGER_SETTLEMENT_UNVERIFIED',
    message: 'KDIC financial settlement is suspended pending verified ledger and authorization controls',
  });
}
