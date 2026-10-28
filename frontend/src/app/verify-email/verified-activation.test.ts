import { describe, expect, it } from 'vitest';
import { hasVerifiedEmailActivationReceipt } from './verified-activation';

const token = 'a'.repeat(43);
const validReceipt = { outcome: 'signed-in', csrfToken: 'b'.repeat(43), consentCurrent: true };
const secureCookie = `__Host-mv_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=15552000; Secure`;
const localCookie = `mv_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=15552000`;

describe('first-party email verification activation evidence', () => {
  it('accepts only the real backend contract with a browser-usable session cookie', () => {
    expect(hasVerifiedEmailActivationReceipt(validReceipt, [secureCookie])).toBe(true);
    expect(hasVerifiedEmailActivationReceipt(validReceipt, [localCookie])).toBe(true);
  });

  it.each([
    null,
    {},
    { ...validReceipt, outcome: 'pending' },
    { ...validReceipt, consentCurrent: false },
    { ...validReceipt, csrfToken: '' },
    { ...validReceipt, csrfToken: 'invalid' },
  ])('rejects an unverified backend completion receipt %#', (payload) => {
    expect(hasVerifiedEmailActivationReceipt(payload, [secureCookie])).toBe(false);
  });

  it.each([
    [],
    [secureCookie, 'other=surprise; Path=/'],
    [`__Host-mv_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Secure`],
    [`__Host-mv_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=15552000`],
    [`__Host-mv_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=15552000; Secure; Domain=example.com`],
    [`__Host-mv_session=${token}; Path=/admin; HttpOnly; SameSite=Lax; Max-Age=15552000; Secure`],
    [`__Host-mv_session=${token}; Path=/; SameSite=Lax; Max-Age=15552000; Secure`],
    [`__Host-mv_session=${token}; Path=/; HttpOnly; SameSite=None; Max-Age=15552000; Secure`],
    [`__Host-mv_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Secure`],
    [`mv_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=15552000; Domain=example.com`],
    [`mv_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=15552000; Max-Age=0`],
    [`other_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=15552000`],
  ])('rejects missing, foreign or browser-rejected session cookies %#', (cookies) => {
    expect(hasVerifiedEmailActivationReceipt(validReceipt, cookies)).toBe(false);
  });
});
