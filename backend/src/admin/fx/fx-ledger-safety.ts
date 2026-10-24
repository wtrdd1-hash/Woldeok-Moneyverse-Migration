import { ServiceUnavailableException } from '@nestjs/common';

/**
 * FX WLD writes bypass the authoritative double-entry ledger in the legacy
 * repository. A 503 prevents a client from treating an unposted balance change
 * as settled. This hold must remain until database-owned atomic, idempotent
 * ledger functions and authenticated end-to-end receipts are verified.
 */
export function requireLedgerBackedFxSettlement(): void {
  throw new ServiceUnavailableException(
    'FX WLD exchange and forward settlement are temporarily unavailable pending ledger integrity verification.',
  );
}
