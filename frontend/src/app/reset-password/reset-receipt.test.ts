import { describe, expect, it, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => ({
  api: vi.fn(),
  redirect: vi.fn((path: string): never => { throw new Error(`REDIRECT:${path}`); }),
}));
vi.mock('next/navigation', () => ({ redirect: mocks.redirect }));
vi.mock('@/lib/api', () => ({ api: mocks.api, ApiError: class ApiError extends Error { status: number; constructor(status: number) { super('API error'); this.status = status; } } }));

import { isPasswordResetReceipt } from './reset-receipt';
import { completePasswordReset } from './actions';

const form = () => {
  const data = new FormData();
  data.set('token', 'a'.repeat(64));
  data.set('password', 'ValidPassword123!');
  data.set('confirmPassword', 'ValidPassword123!');
  return data;
};

describe('password reset mutation receipt', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('accepts only the backend-confirmed password-reset outcome', () => {
    expect(isPasswordResetReceipt({ outcome: 'password-reset' })).toBe(true);
    for (const invalid of [null, undefined, {}, [], { outcome: 'password-changed' }, { outcome: 'password-reset', success: false }, { outcome: 'password-reset', sessionsRevoked: false }, 'password-reset']) {
      expect(isPasswordResetReceipt(invalid)).toBe(false);
    }
  });

  it('redirects to login only with a verified mutation receipt', async () => {
    mocks.api.mockResolvedValue({ outcome: 'password-reset' });
    await expect(completePasswordReset(form())).rejects.toThrow('REDIRECT:/login?password_reset=1');
    expect(mocks.api).toHaveBeenCalledWith('/api/v1/auth/local/password-reset/complete', expect.objectContaining({ method: 'POST' }));
  });

  it.each([undefined, null, {}, { outcome: 'password-changed' }, { outcome: 'password-reset', success: false }])('refuses a contradictory or missing success receipt: %s', async (response) => {
    mocks.api.mockResolvedValue(response);
    await expect(completePasswordReset(form())).rejects.toThrow('REDIRECT:/reset-password?error=unverified&token=');
    expect(mocks.redirect).not.toHaveBeenCalledWith('/login?password_reset=1');
  });

  it('retains existing mismatch protection before the API call', async () => {
    const data = form(); data.set('confirmPassword', 'different');
    await expect(completePasswordReset(data)).rejects.toThrow('REDIRECT:/reset-password?error=mismatch&token=');
    expect(mocks.api).not.toHaveBeenCalled();
  });
});
