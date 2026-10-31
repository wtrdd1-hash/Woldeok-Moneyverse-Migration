import { describe, expect, it, vi } from 'vitest';
import { LocalAuthController } from './local-auth.controller';

vi.mock('./password-hasher', () => ({
  hashPassword: vi.fn(async () => 'hashed'),
  verifyPassword: vi.fn(async () => true),
  spendDummyPasswordWork: vi.fn(),
}));

const email = 'member@example.test';
const userId = '00000000-0000-4000-8000-000000000001';

function loginHarness(consentCurrent: boolean) {
  const notifyUserLogin = vi.fn(async () => true);
  const sessions = { hasCurrentUserConsent: vi.fn(async () => consentCurrent) };
  const credentials = {
    credential: vi.fn(async () => ({ user_id: userId, password_verifier: 'hashed' })),
    completeLogin: vi.fn(async () => ({ token: 'session-token', csrfToken: 'csrf-value', session_id: 'new-session' })),
  };
  const controller = new LocalAuthController(
    { cookieSecure: true } as never, sessions as never, credentials as never, {} as never,
    { notifyUserLogin } as never,
  );
  const request = {
    session: { id: 'prelogin-session', user_id: null },
    ip: '198.51.100.22',
    get: (header: string) => header === 'x-forwarded-for'
      ? '203.0.113.99, 198.51.100.22'
      : header === 'user-agent' ? 'PRIVATE-DEVICE-FINGERPRINT' : undefined,
  } as never;
  return { controller, request, notifyUserLogin };
}

describe('local member Telegram privacy boundary', () => {
  it('does not announce an unverified registration to a third party', async () => {
    const notifyUserRegistered = vi.fn(async () => true);
    const controller = new LocalAuthController(
      { production: false, baseUrl: 'https://example.test' } as never,
      { hasCurrentPreloginConsent: vi.fn(async () => true) } as never,
      { startRegistration: vi.fn(async () => true) } as never,
      { send: vi.fn(async () => undefined) } as never,
      { notifyUserRegistered } as never,
    );
    const result = await controller.register(
      { session: { id: 'prelogin-session', user_id: null } } as never,
      { email, password: 'correct horse battery staple', displayName: 'PRIVATE-NAME' },
    );
    expect(result.verificationRequired).toBe(true);
    expect(notifyUserRegistered).not.toHaveBeenCalled();
  });

  it('does not notify a login when current member consent is absent', async () => {
    const { controller, request, notifyUserLogin } = loginHarness(false);
    await expect(controller.login(request, { setHeader: vi.fn() } as never, {
      email, password: 'correct horse battery staple',
    })).resolves.toMatchObject({ outcome: 'signed-in', consentCurrent: false });
    expect(notifyUserLogin).not.toHaveBeenCalled();
  });

  it('never forwards untrusted IP, user agent or member identifier to Telegram', async () => {
    const { controller, request, notifyUserLogin } = loginHarness(true);
    await controller.login(request, { setHeader: vi.fn() } as never, {
      email, password: 'correct horse battery staple',
    });
    expect(notifyUserLogin).toHaveBeenCalledTimes(1);
    expect(notifyUserLogin).toHaveBeenCalledWith({ consentCurrent: true });
  });
});
