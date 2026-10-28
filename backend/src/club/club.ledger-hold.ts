import { ServiceUnavailableException } from '@nestjs/common';

// Migration 222 mutates cash and sink balances without balanced ledger postings;
// ON CONFLICT DO NOTHING on the transaction key does not prevent repeat debits.
export function rejectUnjournaledClubSettlement(): never {
  throw new ServiceUnavailableException({
    code: 'CLUB_LEDGER_SETTLEMENT_UNAVAILABLE',
    message: 'Club WLD settlement is unavailable pending verified ledger and replay receipts',
  });
}
