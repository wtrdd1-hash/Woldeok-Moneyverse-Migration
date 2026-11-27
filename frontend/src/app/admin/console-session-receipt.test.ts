import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { verifiedConsoleOpen, verifiedConsoleClose } from './console-session-receipt';

const openReceipt = {
  state: 'open', csrfToken: 'synthetic-csrf-token',
  expiresAt: '2027-01-01T00:00:00.000Z', idleExpiresAt: '2026-11-01T00:00:00.000Z',
};
const rotated = 'mv_session=synthetic-token; Path=/; HttpOnly; SameSite=Lax; Max-Age=15552000';
const cleared = 'mv_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0';

// Keep date-sensitive synthetic receipts independent of wall-clock CI time.
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-10-31T12:00:00.000Z'));
});
afterEach(() => { vi.useRealTimers(); });

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

  // Sandbox browser QA: the Spring API opens the console with three Set-Cookie headers (the rotated
  // host session, the host CSRF proof, and a clear of the legacy session) and closes it with four
  // clears. The verifier accepted exactly one header, so the console never opened from the web and
  // the already-rotated session was dropped. These are the API's exact header shapes.
  const springOpen = [
    '__Host-mv_session=synthetic-token; Path=/; Max-Age=2592000; Expires=Sun, 27 Dec 2026 05:29:11 GMT; Secure; HttpOnly; SameSite=Lax',
    '__Host-mv_csrf=synthetic-proof; Path=/; Max-Age=2592000; Expires=Sun, 27 Dec 2026 05:29:11 GMT; Secure; HttpOnly; SameSite=Lax',
    'mv_session=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure; HttpOnly; SameSite=Lax',
  ];
  const springClose = [
    '__Host-mv_session=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure; HttpOnly; SameSite=Lax',
    '__Host-mv_csrf=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure; HttpOnly; SameSite=Lax',
    'mv_csrf=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure; HttpOnly; SameSite=Lax',
    'mv_session=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure; HttpOnly; SameSite=Lax',
  ];

  it('accepts the API open contract: one session, one proof, legacy clears', () => {
    expect(verifiedConsoleOpen(openReceipt, springOpen)).toBe(true);
  });

  it('accepts the API close contract: clears only, including the session', () => {
    expect(verifiedConsoleClose(null, springClose)).toBe(true);
  });

  it.each([
    [[springOpen[0]!, springOpen[0]!, springOpen[1]!]],
    [[springOpen[0]!, springOpen[1]!, springOpen[1]!]],
    [[springOpen[0]!, 'other=token; Path=/; HttpOnly; SameSite=Lax; Max-Age=50']],
    [[springOpen[0]!, '__Host-mv_csrf=proof; Path=/; HttpOnly; SameSite=Lax; Max-Age=50']],
    [[springOpen[0]!, 'mv_session=still; Path=/; HttpOnly; SameSite=Lax; Max-Age=50']],
    [[springOpen[1]!, springOpen[2]!]],
  ])('rejects a multi-cookie open that is not the contract: %j', (headers) => {
    expect(verifiedConsoleOpen(openReceipt, headers)).toBe(false);
  });

  it.each([
    [[springClose[1]!, springClose[2]!]],
    [[...springClose, 'other=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0']],
    [[springClose[0]!, '__Host-mv_csrf=live; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=50']],
  ])('rejects a multi-cookie close that is not the contract: %j', (headers) => {
    expect(verifiedConsoleClose(null, headers)).toBe(false);
  });
});
