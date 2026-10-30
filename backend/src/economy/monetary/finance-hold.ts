import { ServiceUnavailableException } from '@nestjs/common';

/** Avoid returning success from in-memory or non-canonical financial execution paths. */
export function unverifiedFinanceOperation(scope: 'LEGACY_MONETARY_AUTHORITY' | 'MONETARY_SETTLEMENT' | 'TREASURY_SETTLEMENT'): never {
  throw new ServiceUnavailableException({
    code: `${scope}_UNVERIFIED`,
    message: 'Financial settlement and immutable journal evidence are not verified; operation is temporarily unavailable.',
  });
}

/** Manual SWF actions cannot claim settlement without a canonical ledger receipt. */
export function unverifiedSwfSettlement(): never {
  throw new ServiceUnavailableException({
    code: 'SWF_LEDGER_SETTLEMENT_UNAVAILABLE',
    message: 'SWF settlement and immutable ledger evidence are unavailable.',
  });
}
