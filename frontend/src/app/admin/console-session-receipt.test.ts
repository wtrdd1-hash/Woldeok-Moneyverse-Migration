import { describe, expect, it } from 'vitest';
import { verifiedConsoleOpen, verifiedConsoleClose } from './console-session-receipt';

const openReceipt = {
  state: 'open', csrfToken: 'synthetic-csrf-token',
  expiresAt: '2027-01-01T00:00:00.000Z', idleExpiresAt: '2026-11-01T00:00:00.000Z',
};
const rotated = 'mv_session=synthetic-token; Path=/; HttpOnly; SameSite=Lax; Max-Age=15552000';
const cleared = 'mv_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0';

describe('administrator console session evidence', () => {
  it('accepts a verified open body and a browser-storable rotated session cookie', () => {
    expect(verifiedConsoleOpen(openReceipt, [rotated])).toBe(true);
    expect(verifiedConsoleOpen(openReceipt, ['__Host-mv_session=synthetic-token; Path=/; HttpOnly; SameSite=Lax; Max-Age=15552000; Secure'])).toBe(true);
  });

  it.each([
    null, undefined, {}, [], { ...openReceipt, state: 'closed' },
    { ...openReceipt, csrfToken: '' }, { ...openReceipt, expiresAt: 'not-a-date' },
    { ...openReceipt, idleExpiresAt: '2020-01-01T00:00:00.000Z' },
    { ...openReceipt, expiresAt: '2026-10-01T00:00:00.000Z' },
  ])('rejects a missing or contradictory console open body: %s', (receipt) => {
    expect(verifiedConsoleOpen(receipt, [rotated])).toBe(false);
  });

  it.each([
    [], ['other=token; Path=/; HttpOnly; SameSite=Lax; Max-Age=50'],
    ['mv_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=50'],
    ['mv_session=token; Path=/; HttpOnly; SameSite=Lax; Max-Age=0'],
    ['mv_session=token; Path=/; HttpOnly; SameSite=Lax'],
    ['mv_session=token; Path=/; SameSite=Lax; Max-Age=50'],
    ['mv_session=token; Path=/admin; HttpOnly; SameSite=Lax; Max-Age=50'],
    ['mv_session=token; Path=/; HttpOnly; SameSite=None; Max-Age=50'],
    ['mv_session=token; Path=/; HttpOnly; SameSite=Lax; Max-Age=50; Domain=example.com'],
    ['__Host-mv_session=token; Path=/; HttpOnly; SameSite=Lax; Max-Age=50'],
    [rotated, rotated],
  ].map((headers) => ({ headers })))('rejects unverified rotated browser cookies: $headers', ({ headers }) => {
    expect(verifiedConsoleOpen(openReceipt, headers)).toBe(false);
  });

  it('accepts only the canonical deletion cookie for HTTP 204 console closure', () => {
    expect(verifiedConsoleClose(null, [cleared])).toBe(true);
    expect(verifiedConsoleClose(null, ['__Host-mv_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Secure'])).toBe(true);
  });

  it.each([
    [undefined, [cleared]], [{ state: 'closed' }, [cleared]], [null, []],
    [null, [rotated]], [null, ['mv_session=still-active; Path=/; HttpOnly; SameSite=Lax; Max-Age=0']],
    [null, ['mv_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=1']],
    [null, ['__Host-mv_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0']],
  ] as const)('rejects missing or contradictory console closure evidence: %j', (body, headers) => {
    expect(verifiedConsoleClose(body, headers)).toBe(false);
  });
});
