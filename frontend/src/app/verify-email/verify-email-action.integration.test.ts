import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({
  redirect: (path: string) => { throw new Error(`REDIRECT:${path}`); },
}));
vi.mock('@/lib/api', () => ({
  apiWithCookie: vi.fn(),
  ApiError: class ApiError extends Error { constructor(readonly status: number) { super('API error'); } },
}));
vi.mock('@/lib/cookie-relay', () => ({ relaySetCookie: vi.fn() }));

import { apiWithCookie } from '@/lib/api';
import { relaySetCookie } from '@/lib/cookie-relay';
import { completeEmailVerification } from './actions';

const token = 'x'.repeat(43);
const validCookie = `__Host-mv_session=${'a'.repeat(43)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=15552000; Secure`;
const payload = { outcome: 'signed-in', csrfToken: 'b'.repeat(43), consentCurrent: true };
const form = () => { const data = new FormData(); data.set('token', token); return data; };

beforeEach(() => { vi.clearAllMocks(); });

describe('email activation Next-to-NestJS receipt integration', () => {
  it('relays a verified session and only then confirms registration', async () => {
    vi.mocked(apiWithCookie).mockResolvedValue({ payload, setCookie: [validCookie] });
    await expect(completeEmailVerification(form())).rejects.toThrow('REDIRECT:/?registration=verified');
    expect(relaySetCookie).toHaveBeenCalledWith([validCookie]);
  });

  it('does not relay cookies or claim success when a 2xx payload contradicts backend contract', async () => {
    vi.mocked(apiWithCookie).mockResolvedValue({ payload: { outcome: 'pending' }, setCookie: [validCookie] });
    await expect(completeEmailVerification(form())).rejects.toThrow('REDIRECT:/verify-email?status=unconfirmed');
    expect(relaySetCookie).not.toHaveBeenCalled();
  });

  it('does not claim success when the backend returns no valid session cookie', async () => {
    vi.mocked(apiWithCookie).mockResolvedValue({ payload, setCookie: [] });
    await expect(completeEmailVerification(form())).rejects.toThrow('REDIRECT:/verify-email?status=unconfirmed');
    expect(relaySetCookie).not.toHaveBeenCalled();
  });

  it('does not claim success when cookie relay fails after token consumption', async () => {
    vi.mocked(apiWithCookie).mockResolvedValue({ payload, setCookie: [validCookie] });
    vi.mocked(relaySetCookie).mockRejectedValueOnce(new Error('cookie store unavailable'));
    await expect(completeEmailVerification(form())).rejects.toThrow('REDIRECT:/verify-email?status=unconfirmed');
  });

  it('keeps an invalid token from reaching the API', async () => {
    const data = new FormData(); data.set('token', 'short');
    await expect(completeEmailVerification(data)).rejects.toThrow('REDIRECT:/verify-email?status=invalid');
    expect(apiWithCookie).not.toHaveBeenCalled();
  });
});
