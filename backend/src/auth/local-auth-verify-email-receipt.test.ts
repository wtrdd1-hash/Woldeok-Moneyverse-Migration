import { describe, expect, it, vi } from 'vitest';
import { LocalAuthController } from './local-auth.controller';

const token = 'a'.repeat(43);
const csrfToken = 'b'.repeat(43);

describe('email verification backend activation contract', () => {
  it('issues the exact signed-in receipt and one browser-usable session cookie', async () => {
    const completeRegistration = vi.fn().mockResolvedValue({ token, csrfToken });
    const setHeader = vi.fn();
    const controller = new LocalAuthController(
      { cookieSecure: true } as never,
      {} as never,
      { completeRegistration } as never,
      {} as never,
    );
    await expect(controller.verifyEmail({ setHeader } as never, { token: 'one-time-token' })).resolves.toEqual({
      outcome: 'signed-in', csrfToken, consentCurrent: true,
    });
    expect(completeRegistration).toHaveBeenCalledWith('one-time-token');
    expect(setHeader).toHaveBeenCalledWith(
      'set-cookie',
      `__Host-mv_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=15552000; Secure`,
    );
  });

  it('does not issue a session cookie or success receipt when verification fails', async () => {
    const setHeader = vi.fn();
    const controller = new LocalAuthController(
      { cookieSecure: true } as never,
      {} as never,
      { completeRegistration: vi.fn().mockRejectedValue(new Error('expired')) } as never,
      {} as never,
    );
    await expect(controller.verifyEmail({ setHeader } as never, { token: 'expired' })).rejects.toThrow('verification failed');
    expect(setHeader).not.toHaveBeenCalled();
  });
});
