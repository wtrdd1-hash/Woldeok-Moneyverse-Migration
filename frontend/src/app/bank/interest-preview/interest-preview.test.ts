import { describe, expect, it } from 'vitest';
import { parseInterestClaimPreview } from './interest-preview';
import { appGatewayPath } from '@/lib/app-gateway';

describe('interest claim preview web and Android contract', () => {
  it('accepts exact WLD strings without Number conversion', () => {
    const value = { currentBankBalanceWld: '900719925474099312345678901234567890',
      accruedInterestWld: '2', hypotheticalBankBalanceWld: '900719925474099312345678901234567892',
      isReadOnlyPreview: true };
    expect(parseInterestClaimPreview(value)).toEqual(value);
  });

  it.each([null, {}, { currentBankBalanceWld: '2', accruedInterestWld: '3',
    hypotheticalBankBalanceWld: '4', isReadOnlyPreview: true },
    { currentBankBalanceWld: '2', accruedInterestWld: '3',
      hypotheticalBankBalanceWld: '5', isReadOnlyPreview: false },
  ])('rejects stale, fabricated or malformed previews: %j', (value) => {
    expect(parseInterestClaimPreview(value)).toBeNull();
  });

  it('maps the same authenticated API to the Android app-api gateway', () => {
    expect(appGatewayPath(['banking', 'claim-interest', 'preview']))
      .toBe('/api/v1/banking/claim-interest/preview');
  });
});
