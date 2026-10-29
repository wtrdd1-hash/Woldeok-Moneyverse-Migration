import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mutate, read, withCookie, revalidate } = vi.hoisted(() => ({
  mutate: vi.fn(), read: vi.fn(), withCookie: vi.fn(), revalidate: vi.fn(),
}));
vi.mock('@/lib/mutate', () => ({ mutate }));
vi.mock('@/lib/api', () => ({ api: read, apiWithCookie: withCookie }));
vi.mock('@/lib/cookie-relay', () => ({ relaySetCookie: vi.fn() }));
vi.mock('next/cache', () => ({ revalidatePath: revalidate }));
vi.mock('next/navigation', () => ({ redirect: (url: string) => { throw new Error(`REDIRECT:${url}`); } }));

import { terminateSession, terminateOtherSessions, terminateAllSessions } from './actions';

const current = {
  sessionId: 'a9745c4f-20b1-45b8-a8e0-4c7cc19ce01e',
  createdAt: '2026-10-01T01:00:00.000Z', expiresAt: '2027-01-01T00:00:00.000Z',
  reauthenticatedAt: null, current: true, administratorSession: false,
  lastSeenAt: '2026-10-28T01:00:00.000Z', deviceLabel: 'Desktop browser',
};
const other = { ...current, sessionId: 'b9745c4f-20b1-45b8-a8e0-4c7cc19ce01e', current: false };

beforeEach(() => { vi.clearAllMocks(); });

describe('session revocation persistence receipts', () => {
  it('rejects an invalid bulk revocation receipt instead of announcing success', async () => {
    mutate.mockResolvedValue({ revokedSessions: '2' });
    await expect(terminateOtherSessions()).rejects.toThrow('REDIRECT:/account/security?error=reauth-required');
    expect(read).not.toHaveBeenCalled();
  });

  it('does not claim bulk success when readback still shows another active session', async () => {
    mutate.mockResolvedValue({ revokedSessions: 1 });
    read.mockResolvedValue({ sessions: [current, other] });
    await expect(terminateOtherSessions()).rejects.toThrow('REDIRECT:/account/security?error=reauth-required');
  });

  it('does not claim individual revocation when the target remains in verified inventory', async () => {
    mutate.mockResolvedValue({ revoked: true });
    read.mockResolvedValue({ sessions: [current, other] });
    const form = new FormData(); form.set('sessionId', other.sessionId);
    await expect(terminateSession(form)).rejects.toThrow('REDIRECT:/account/security?error=reauth-required');
  });

  it('reports verified bulk revocation only after a fresh owner session read', async () => {
    mutate.mockResolvedValue({ revokedSessions: 1 });
    read.mockResolvedValue({ sessions: [current] });
    await expect(terminateOtherSessions()).rejects.toThrow('REDIRECT:/account/security?revoked=1');
    expect(read).toHaveBeenCalledWith('/api/v1/account/security/sessions');
  });

  it('confirms a single target is gone before reporting its revocation', async () => {
    mutate.mockResolvedValue({ revoked: true });
    read.mockResolvedValue({ sessions: [current] });
    const form = new FormData(); form.set('sessionId', other.sessionId);
    await expect(terminateSession(form)).rejects.toThrow('REDIRECT:/account/security?session=revoked');
  });

  it('finishes all-device signout after verified other-session removal', async () => {
    mutate.mockResolvedValue({ revokedSessions: 1 });
    read.mockResolvedValueOnce({ sessions: [current] }).mockResolvedValueOnce({ csrfToken: 'synthetic-test-csrf' });
    withCookie.mockResolvedValue({ payload: null, setCookie: ['mv_session=; Path=/; Max-Age=0; HttpOnly'] });
    await expect(terminateAllSessions()).rejects.toThrow('REDIRECT:/login?signed_out_all=1');
    expect(withCookie).toHaveBeenCalledWith('/api/v1/auth/logout', {
      method: 'POST', csrfToken: 'synthetic-test-csrf',
    });
  });

  it('does not report all-device logout success when current-session logout fails', async () => {
    mutate.mockResolvedValue({ revokedSessions: 1 });
    read.mockResolvedValueOnce({ sessions: [current] }).mockResolvedValueOnce({ csrfToken: 'synthetic-test-csrf' });
    withCookie.mockRejectedValue(new Error('logout API unavailable'));
    await expect(terminateAllSessions()).rejects.toThrow('REDIRECT:/account/security?error=logout');
  });

  it('does not promise all-device signout on malformed revoke receipt', async () => {
    mutate.mockResolvedValue({ revokedSessions: null });
    await expect(terminateAllSessions()).rejects.toThrow('REDIRECT:/account/security?error=reauth-required');
    expect(withCookie).not.toHaveBeenCalled();
  });
});
