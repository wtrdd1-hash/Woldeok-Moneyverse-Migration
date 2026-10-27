import { ServiceUnavailableException } from '@nestjs/common';

/**
 * Migration 234 debits USER_CASH and credits SINK without an authoritative
 * double-entry ledger transaction. Do not allow certification until a
 * forward-only migration provides atomic ledger-backed settlement and replay.
 *
 * This is API/repository containment only. It does NOT revoke direct database
 * EXECUTE privileges on the already-applied function.
 */
export function refuseUnjournaledQualification(): never {
  throw new ServiceUnavailableException({
    code: 'WORK_QUALIFICATION_LEDGER_UNAVAILABLE',
    message: 'Career qualification purchases are unavailable pending verified ledger settlement.',
  });
}
