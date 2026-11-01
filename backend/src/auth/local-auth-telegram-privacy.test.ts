import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LocalAuthController } from './local-auth.controller';

vi.mock('./password-hasher', () => ({
  hashPassword: vi.fn(async () => 'hashed-password'),
  verifyPassword: vi.fn(async () => true),
  spendDummyPasswordWork: vi.fn(async () => undefined),
}));

const registration = { email: 'unverified@example.test', password: 'strong-test-password', displayName: 'Unverified User' };
const login = { email: 'verified@example.test', password: 'strong-test-password' };
const config = { baseUrl: 'https://example.test', cookieSecure: true, production: false, localAuthTestVerificationTokenEnabled: false };

function fixture(consentCurrent: boolean) {
  const sessions = {
    hasCurrentPreloginConsent: vi.fn(async () => true),
    hasCurrentUserConsent: vi.fn(async () => consentCurrent),
  };
  const credentials = {
    startRegistration: vi.fn(async () => true),
    credential: vi.fn(async () => ({ user_id: 'private-user-uuid', password_verifier: 'stored-verifier' })),
    completeLogin: vi.fn(async () => ({ session_id: 'signed-in-session', token: 'session-token', csrfToken: 'csrf-token' })),
  };
  const mailer = { send: vi.fn(async () => undefined) };
  const telegram = { notifyUserRegistered: vi.fn(async () => true), notifyUserLogin: vi.fn(async () => true) };
  const controller = new LocalAuthController(config as never, sessions as never, credentials as never, mailer as never, telegram as never);
  const request = {
    session: { id: 'prelogin-session', user_id: null },
    ip: '198.51.100.200',
    get: vi.fn((header: string) => header === 'x-forwarded-for' ? '203.0.113.99, 198.51.100.200' : 'Sensitive Browser Agent'),
  };
  const response = { setHeader: vi.fn() };
  return { controller, sessions, credentials, mailer, telegram, request, response };
}

describe('member authentication Telegram privacy boundary', () => {
  beforeEach(() => vi.clearAllMocks());

  it('does not announce an unverified registration or disclose email/name before verification', async () => {
    const f = fixture(true);
    const result = await f.controller.register(f.request as never, registration);
    expect(result.accepted).toBe(true);
    expect(result.verificationRequired).toBe(true);
    expect(f.mailer.send).toHaveBeenCalledTimes(1);
    expect(f.telegram.notifyUserRegistered).not.toHaveBeenCalled();
  });

  it('does not send member login alert without current user consent', async () => {
    const f = fixture(false);
    const result = await f.controller.login(f.request as never, f.response as never, login);
    expect(result).toMatchObject({ outcome: 'signed-in', consentCurrent: false });
    expect(f.response.setHeader).toHaveBeenCalledWith('set-cookie', expect.any(String));
    expect(f.telegram.notifyUserLogin).not.toHaveBeenCalled();
  });

  it('sends only a payload-free generic login event after current consent', async () => {
    const f = fixture(true);
    const result = await f.controller.login(f.request as never, f.response as never, login);
    expect(result).toMatchObject({ outcome: 'signed-in', consentCurrent: true });
    expect(f.telegram.notifyUserLogin).toHaveBeenCalledExactlyOnceWith();
    expect(f.request.get).not.toHaveBeenCalled();
  });
});
