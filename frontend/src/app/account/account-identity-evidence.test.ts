import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseAccountIdentityEvidence, confirmedOAuthCallback } from './account-identity-evidence';
const valid = { identityId: '123e4567-e89b-42d3-a456-426614174000', provider: 'google', displayName: 'Member', linkedAt: '2026-10-20T10:00:00.000Z' };
describe('account sign-in identity evidence', () => {
  it('distinguishes empty list from unavailable responses', () => {
    expect(parseAccountIdentityEvidence({ identities: [] })).toEqual({ status: 'ready', identities: [] });
    for (const payload of [null, {}, { identities: null }, { identities: [valid, valid] }, { identities: [{ ...valid, provider: 'fake' }] }, { identities: [{ ...valid, linkedAt: 'bad' }] }]) expect(parseAccountIdentityEvidence(payload).status).toBe('unavailable');
  });
  it('confirms only observed OAuth providers', () => {
    const evidence = parseAccountIdentityEvidence({ identities: [valid] });
    expect(confirmedOAuthCallback('google', evidence)).toBe(true);
    expect(confirmedOAuthCallback('discord', evidence)).toBe(false);
    expect(confirmedOAuthCallback('google', parseAccountIdentityEvidence(null))).toBe(false);
  });
  it('keeps account screen truthful and accessible', () => {
    const page = readFileSync('src/app/account/page.tsx', 'utf8');
    expect(page).toContain('parseAccountIdentityEvidence(identityData)');
    expect(page).toContain('다시 조회하기');
    expect(page).toContain('role="alert"');
    expect(page).not.toContain('securityScore');
    expect(page).not.toContain('<Progress');
    expect(page).toContain('confirmedOAuthCallback(linked, identityEvidence)');
    expect(page).toContain('robots: { index: false, follow: false }');
  });
});