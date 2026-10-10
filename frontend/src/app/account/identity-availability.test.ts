import { describe, expect, it } from 'vitest';
import { getIdentitySecuritySummary } from './identity-availability';

describe('getIdentitySecuritySummary', () => {
  it('does not treat a failed identity read as an empty account', () => {
    expect(getIdentitySecuritySummary(null)).toEqual({
      count: null,
      score: null,
      hasLocalIdentity: null,
      hasSocialIdentity: null,
    });
  });

  it('preserves a verified empty result as zero identities', () => {
    expect(getIdentitySecuritySummary([])).toEqual({
      count: 0,
      score: 70,
      hasLocalIdentity: false,
      hasSocialIdentity: false,
    });
  });

  it('calculates status only from successfully fetched identities', () => {
    expect(getIdentitySecuritySummary([{ provider: 'local_email' }, { provider: 'google' }])).toEqual({
      count: 2,
      score: 100,
      hasLocalIdentity: true,
      hasSocialIdentity: true,
    });
  });
});
