import { describe, expect, it, vi } from 'vitest';
import { LocalAuthController } from './local-auth.controller';

vi.mock('./password-hasher', () => ({
  hashPassword: vi.fn(async () => 'hashed-password'),
  verifyPassword: vi.fn(),
  spendDummyPasswordWork: vi.fn(),
}));

const request = { session: { id: 'prelogin-session', user_id: null } } as never;
const sessions = { hasCurrentPreloginConsent: vi.fn(async () => true) };
const credentials = { startRegistration: vi.fn(async () => true) };
const failingMailer = { send: vi.fn(async () => { throw new Error('smtp unavailable'); }) };

describe('LocalAuthController staging verification-token escape hatch', () => {
  it('returns a token on the isolated test host when the explicit safe flag is enabled', async () => {
    const controller = new LocalAuthController(
      { production: true, localAuthTestVerificationTokenEnabled: true, baseUrl: 'https://test.easy-scraping.com/' } as never,
      sessions as never, credentials as never, failingMailer as never,
    );
    const result = await controller.register(request, { email: 'qa@example.test', password: 'safe-test-password', displayName: 'QA User' });
    expect(result.accepted).toBe(true);
    expect(result.verificationRequired).toBe(true);
    expect(result.verificationToken).toEqual(expect.any(String));
  });

  it('still fails closed when production does not enable the safe test flag', async () => {
    const controller = new LocalAuthController(
      { production: true, localAuthTestVerificationTokenEnabled: false, baseUrl: 'https://easy-scraping.com/' } as never,
      sessions as never, credentials as never, failingMailer as never,
    );
    await expect(controller.register(request, { email: 'qa@example.test', password: 'safe-test-password', displayName: 'QA User' })).rejects.toThrow('smtp unavailable');
  });
});