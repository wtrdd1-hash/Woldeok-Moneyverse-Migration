import { describe, expect, it } from 'vitest';
import { canPublishConsentPolicy, parseConsentPolicyEvidence } from './consent-policy-evidence';

describe('authenticated consent policy evidence', () => {
  it('accepts the current backend contract without changing canonical version text', () => {
    expect(parseConsentPolicyEvidence({ termsVersion: '2026-10-27', privacyVersion: 'v2026.10.27-2' })).toEqual({
      termsVersion: '2026-10-27',
      privacyVersion: 'v2026.10.27-2',
    });
  });

  it.each([
    null, undefined, [], {},
    { termsVersion: '2026-10-27' },
    { termsVersion: 20261027, privacyVersion: '2026-10-27' },
    { termsVersion: '', privacyVersion: '2026-10-27' },
    { termsVersion: ' 2026-10-27', privacyVersion: '2026-10-27' },
    { termsVersion: '<script>', privacyVersion: '2026-10-27' },
    { termsVersion: 'x'.repeat(65), privacyVersion: '2026-10-27' },
    { termsVersion: '2026-10-27', privacyVersion: null },
  ])('rejects unavailable or malformed policy evidence: %j', (response) => {
    expect(parseConsentPolicyEvidence(response)).toBeNull();
  });

  it('permits publication UI only for an actual superadmin with verified versions', () => {
    const policy = parseConsentPolicyEvidence({ termsVersion: '2026-10-27', privacyVersion: '2026-10-27' });
    expect(canPublishConsentPolicy(['operator'], policy)).toBe(false);
    expect(canPublishConsentPolicy([], policy)).toBe(false);
    expect(canPublishConsentPolicy(['superadmin'], null)).toBe(false);
    expect(canPublishConsentPolicy(['operator', 'superadmin'], policy)).toBe(true);
  });
});
