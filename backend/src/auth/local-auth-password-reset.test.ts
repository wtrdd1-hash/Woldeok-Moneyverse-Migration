import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { LocalAuthController } from './local-auth.controller';

describe('LocalAuthController password recovery', () => {
  it('keeps request responses indistinguishable while only mailing accepted accounts', async () => {
    const localAuth = { startPasswordReset: vi.fn(async () => false) };
    const mail = { send: vi.fn() };
    const controller = new LocalAuthController({ baseUrl: 'https://example.test' } as never, null, localAuth as never, mail as never);
    await expect(controller.requestPasswordReset({ email: 'missing@example.com' })).resolves.toEqual({ accepted: true });
    expect(mail.send).not.toHaveBeenCalled();
  });

  it('replaces the password through a one-time token', async () => {
    const localAuth = { completePasswordReset: vi.fn(async () => true) };
    const controller = new LocalAuthController({} as never, null, localAuth as never, {} as never);
    await expect(controller.completePasswordReset({ token: 'x'.repeat(32), password: 'new secure passphrase 2026!' })).resolves.toEqual({ outcome: 'password-reset' });
    expect(localAuth.completePasswordReset).toHaveBeenCalledOnce();
  });

  it('rejects weak passwords and invalid or consumed reset tokens', async () => {
    const localAuth = { completePasswordReset: vi.fn(async () => false) };
    const controller = new LocalAuthController({} as never, null, localAuth as never, {} as never);
    await expect(controller.completePasswordReset({ token: 'x'.repeat(32), password: 'password' })).rejects.toBeInstanceOf(ForbiddenException);
    await expect(controller.completePasswordReset({ token: 'x'.repeat(32), password: 'new secure passphrase 2026!' })).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
