import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  mutate: vi.fn(), api: vi.fn(), apiWithCookie: vi.fn(), relaySetCookie: vi.fn(),
}));
vi.mock('next/navigation', () => ({ redirect: (path: string): never => { throw new Error(`REDIRECT:${path}`); } }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/lib/api', () => ({ api: mocks.api, apiWithCookie: mocks.apiWithCookie }));
vi.mock('@/lib/cookie-relay', () => ({ relaySetCookie: mocks.relaySetCookie }));
vi.mock('@/lib/mutate', () => ({ mutate: mocks.mutate }));

import { terminateAllSessions } from './actions';

const current = {
  sessionId: 'a9745c4f-20b1-45b8-a8e0-4c7cc19ce01e',
  createdAt: '2026-10-01T01:00:00.000Z', expiresAt: '2027-01-01T00:00:00.000Z',
  reauthenticatedAt: null, current: true, administratorSession: false,
  lastSeenAt: '2026-10-28T01:00:00.000Z', deviceLabel: 'Desktop browser',
};
const CLEAR_COOKIE = '__Host-mv_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Secure';

beforeEach(() => {
  vi.resetAllMocks();
  mocks.mutate.mockResolvedValue({ revokedSessions: 2 });
  mocks.api.mockImplementation(async (path: string) =>
    path === '/api/v1/account/security/sessions' ? { sessions: [current] } : { csrfToken: 'one-time-csrf' });
  mocks.apiWithCookie.mockResolvedValue({ payload: null, setCookie: [CLEAR_COOKIE] });
  mocks.relaySetCookie.mockResolvedValue(undefined);
});

describe('all-device sign-out completion receipt', () => {
  it('confirms completion only after verified revocation, logout and session cookie clearance', async () => {
    await expect(terminateAllSessions()).rejects.toThrow('REDIRECT:/login?signed_out_all=1');
    expect(mocks.mutate).toHaveBeenCalledWith('/api/v1/account/security/sessions/revoke-others');
    expect(mocks.api).toHaveBeenCalledWith('/api/v1/account/security/sessions');
    expect(mocks.apiWithCookie).toHaveBeenCalledWith('/api/v1/auth/logout', {
      method: 'POST', csrfToken: 'one-time-csrf',
    });
    expect(mocks.relaySetCookie).toHaveBeenCalledWith([CLEAR_COOKIE]);
  });

  it('never attempts current-session logout when revoking other sessions fails', async () => {
    mocks.mutate.mockRejectedValue(new Error('reauthentication expired'));
    await expect(terminateAllSessions()).rejects.toThrow('REDIRECT:/account/security?error=reauth-required');
    expect(mocks.apiWithCookie).not.toHaveBeenCalled();
  });

  it('does not report all devices signed out when fetching logout CSRF fails', async () => {
    mocks.api.mockImplementation(async (path: string) => {
      if (path === '/api/v1/account/security/sessions') return { sessions: [current] };
      throw new Error('session unavailable');
    });
    await expect(terminateAllSessions()).rejects.toThrow('REDIRECT:/account/security?error=logout');
    expect(mocks.apiWithCookie).not.toHaveBeenCalled();
  });

  it('does not report success when the backend refuses current-session logout', async () => {
    mocks.apiWithCookie.mockRejectedValue(new Error('backend unavailable'));
    await expect(terminateAllSessions()).rejects.toThrow('REDIRECT:/account/security?error=logout');
    expect(mocks.relaySetCookie).not.toHaveBeenCalled();
  });

  it.each([
    [],
    ['unrelated=; Max-Age=0'],
    ['__Host-mv_session=nonempty; Max-Age=0; Secure'],
    ['__Host-mv_session=; Max-Age=3600; Secure'],
    ['__Host-mv_session=; Max-Age=0; Path=/'],
    ['__Host-mv_session=; Max-Age=0; Path=/; Secure; Domain=example.com'],
  ])('rejects logout response without an authentic clearing session cookie: %j', async (setCookie) => {
    mocks.apiWithCookie.mockResolvedValue({ payload: null, setCookie });
    await expect(terminateAllSessions()).rejects.toThrow('REDIRECT:/account/security?error=logout');
    expect(mocks.relaySetCookie).not.toHaveBeenCalled();
  });

  it('accepts a correctly cleared local HTTP session cookie', async () => {
    const cookie = 'mv_session=; Path=/; Max-Age=0; HttpOnly';
    mocks.apiWithCookie.mockResolvedValue({ payload: null, setCookie: [cookie] });
    await expect(terminateAllSessions()).rejects.toThrow('REDIRECT:/login?signed_out_all=1');
    expect(mocks.relaySetCookie).toHaveBeenCalledWith([cookie]);
  });

  it('does not report success when browser cookie relay fails', async () => {
    mocks.relaySetCookie.mockRejectedValue(new Error('cookie write failed'));
    await expect(terminateAllSessions()).rejects.toThrow('REDIRECT:/account/security?error=logout');
  });

  it('does not accept an invalid backend revocation count as an all-device success', async () => {
    mocks.mutate.mockResolvedValue({ revokedSessions: -1 });
    await expect(terminateAllSessions()).rejects.toThrow('REDIRECT:/account/security?error=reauth-required');
    expect(mocks.apiWithCookie).not.toHaveBeenCalled();
  });
});
