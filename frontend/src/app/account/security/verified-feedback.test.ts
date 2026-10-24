import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { hasRecentServerReauthentication, isConfirmedPasswordChange, isConfirmedEmailRequest, isConfirmedReauthentication, isConfirmedRevocationCount } from './verified-feedback';

const page = readFileSync('src/app/account/security/page.tsx', 'utf8');
const actions = readFileSync('src/app/account/security/actions.ts', 'utf8');

describe('server-verified account security feedback', () => {
  it('rejects URL-only success claims for sensitive actions', () => {
    for (const unsafe of ["params.reauth === 'done'", "params.email === 'verification-sent'", "params.password === 'changed'", "params.session === 'revoked'", "revoked !== null"]) {
      expect(page).not.toContain(unsafe);
    }
    expect(page).toContain('hasRecentServerReauthentication');
    expect(page).toContain('sessionData?.sessions');
    expect(page).toContain('최근 보안 활동');
  });

  it('confirms only a recent current-session server reauthentication', () => {
    const now = Date.parse('2026-10-25T00:40:00Z');
    expect(hasRecentServerReauthentication([{ current: true, reauthenticatedAt: '2026-10-25T00:39:00Z' }], now)).toBe(true);
    expect(hasRecentServerReauthentication([{ current: false, reauthenticatedAt: '2026-10-25T00:39:00Z' }], now)).toBe(false);
    expect(hasRecentServerReauthentication([{ current: true, reauthenticatedAt: '2026-10-25T00:20:00Z' }], now)).toBe(false);
    expect(hasRecentServerReauthentication([{ current: true, reauthenticatedAt: '2026-10-25T00:41:00Z' }], now)).toBe(false);
    expect(hasRecentServerReauthentication([{ current: true, reauthenticatedAt: null }], now)).toBe(false);
    expect(hasRecentServerReauthentication(null, now)).toBe(false);
  });

  it('rejects success-shaped HTTP 200 responses with invalid bodies', () => {
    expect(isConfirmedPasswordChange({ outcome: 'password-changed' })).toBe(true);
    expect(isConfirmedPasswordChange({ outcome: 'not-changed' })).toBe(false);
    expect(isConfirmedReauthentication({ outcome: 'reauthenticated' })).toBe(true);
    expect(isConfirmedReauthentication({ outcome: 'denied' })).toBe(false);
    expect(isConfirmedEmailRequest({ accepted: true, verificationRequired: true })).toBe(true);
    expect(isConfirmedEmailRequest({ accepted: false, verificationRequired: true })).toBe(false);
    expect(isConfirmedRevocationCount({ revokedSessions: 2 })).toBe(true);
    expect(isConfirmedRevocationCount({ revokedSessions: -1 })).toBe(false);
    expect(isConfirmedRevocationCount({ revokedSessions: '2' })).toBe(false);
    expect(isConfirmedRevocationCount(null)).toBe(false);
  });

  it('requires verified mutation responses before action navigation', () => {
    for (const guard of ['isConfirmedPasswordChange', 'isConfirmedReauthentication', 'isConfirmedEmailRequest', 'isConfirmedRevocationCount']) {
      expect(actions).toContain(guard);
    }
  });
});
