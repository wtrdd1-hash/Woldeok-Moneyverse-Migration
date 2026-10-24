import { ServiceUnavailableException } from '@nestjs/common';

/**
 * P0 containment: legacy KTB mutations change account_balances without a
 * matching authoritative ledger posting. A SQL transaction alone cannot
 * repair that accounting violation. Remove this guard only with a verified
 * SECURITY DEFINER ledger settlement and replay-safe receipt contract.
 */
export function requireLedgerBackedBondSettlement(): void {
  throw new ServiceUnavailableException({
    code: 'bond_ledger_settlement_unavailable',
    message: 'Treasury bond WLD settlement is unavailable pending ledger integrity verification',
  });
}
