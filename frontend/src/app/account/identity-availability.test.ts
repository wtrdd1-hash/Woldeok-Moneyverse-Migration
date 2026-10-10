import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { getIdentitySecuritySummary } from './identity-availability';

describe('account identity availability (fail-closed)', () => {
  it('does not interpret an API failure as zero linked identities', () => {
    expect(getIdentitySecuritySummary(null)).toEqual({
      count: null,
      score: null,
      hasLocalIdentity: null,
      hasSocialIdentity: null,
    });
  });

  it('preserves an authoritative empty identity list', () => {
    expect(getIdentitySecuritySummary([])).toEqual({
      count: 0,
      score: 70,
      hasLocalIdentity: false,
      hasSocialIdentity: false,
    });
  });

  it('derives linked status only from an authoritative response', () => {
    expect(getIdentitySecuritySummary([{ provider: 'local_email' }, { provider: 'google' }])).toEqual({
      count: 2,
      score: 100,
      hasLocalIdentity: true,
      hasSocialIdentity: true,
    });
  });

  it('keeps linking controls unavailable when identity retrieval failed', () => {
    const source = readFileSync('src/app/account/page.tsx', 'utf8');
    expect(source).toContain('identityStatus.count !== null && available.length > 0');
    expect(source).toContain('identityStatus.count === null');
    expect(source).toContain('securityScore !== null && <Progress');
  });
});
