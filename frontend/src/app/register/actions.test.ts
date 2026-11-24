// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

const calls = vi.hoisted(() => ({ api: vi.fn(), withCookie: vi.fn(), orNull: vi.fn() }));

vi.mock('next/navigation', () => ({
  redirect: (to: string) => {
    throw new Error(`REDIRECT ${to}`);
  },
}));
vi.mock('@/lib/cookie-relay', () => ({ relaySetCookie: async () => undefined, sessionCookiePair: () => 'mv_session=s' }));
vi.mock('@/lib/api', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    api: (...args: unknown[]) => calls.api(...args),
    apiWithCookie: (...args: unknown[]) => calls.withCookie(...args),
    apiOrNull: (...args: unknown[]) => calls.orNull(...args),
  };
});

const { ApiError } = await import('@/lib/api');
const { submitLocalRegister } = await import('./actions');

function form(): FormData {
  const data = new FormData();
  data.set('email', 'member@example.invalid');
  data.set('password', 'long-enough-pass');
  data.set('displayName', '길드원');
  return data;
}

describe('local registration against the Spring contract', () => {
  beforeEach(() => {
    calls.api.mockReset();
    calls.withCookie.mockReset();
    calls.orNull.mockReset();
    calls.withCookie.mockResolvedValueOnce({ payload: { signedIn: false, csrfToken: 'c' }, setCookie: [] });
    calls.orNull.mockResolvedValue({ termsVersion: 't', privacyVersion: 'p' });
  });

  it('stops before registering when consent cannot be recorded (Spring 404)', async () => {
    calls.api.mockRejectedValue(new ApiError(404));
    await expect(submitLocalRegister(form())).rejects.toThrow('REDIRECT /register?error=local_registration_unavailable');
    expect(calls.withCookie).toHaveBeenCalledTimes(1);
  });

  it('explains that local sign-up is closed when Spring answers 503', async () => {
    calls.api.mockResolvedValue({});
    calls.withCookie.mockRejectedValueOnce(new ApiError(503, 'LOCAL_REGISTRATION_CONTRACT_UNAVAILABLE'));
    await expect(submitLocalRegister(form())).rejects.toThrow('REDIRECT /register?error=local_registration_unavailable');
  });

  it('keeps the e-mail conflict message for 409', async () => {
    calls.api.mockResolvedValue({});
    calls.withCookie.mockRejectedValueOnce(new ApiError(409));
    await expect(submitLocalRegister(form())).rejects.toThrow('REDIRECT /register?error=email_conflict');
  });
});
