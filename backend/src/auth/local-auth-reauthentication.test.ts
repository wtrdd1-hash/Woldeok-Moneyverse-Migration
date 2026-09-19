import { UnauthorizedException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { LocalAuthController } from './local-auth.controller';
import { hashPassword } from './password-hasher';

const request = { session: { id: 'session-id', user_id: 'user-id' } } as never;

describe('LocalAuthController.reauthenticate', () => {
  it('marks the current session after the matching local password is verified', async () => {
    const password = 'correct horse battery staple';
    const credential = { user_id: 'user-id', password_verifier: await hashPassword(password) };
    const sessions = { markLocalReauthenticated: vi.fn(async () => true) };
    const localAuth = { credential: vi.fn(async () => credential) };
    const controller = new LocalAuthController({} as never, sessions as never, localAuth as never, {} as never);

    await expect(controller.reauthenticate(request, { email: 'member@example.com', password })).resolves.toEqual({ outcome: 'reauthenticated' });
    expect(sessions.markLocalReauthenticated).toHaveBeenCalledWith('session-id', 'user-id');
  });

  it('does not reauthenticate with another account credential', async () => {
    const password = 'correct horse battery staple';
    const credential = { user_id: 'other-user', password_verifier: await hashPassword(password) };
    const sessions = { markLocalReauthenticated: vi.fn(async () => true) };
    const localAuth = { credential: vi.fn(async () => credential) };
    const controller = new LocalAuthController({} as never, sessions as never, localAuth as never, {} as never);

    await expect(controller.reauthenticate(request, { email: 'other@example.com', password })).rejects.toBeInstanceOf(UnauthorizedException);
    expect(sessions.markLocalReauthenticated).not.toHaveBeenCalled();
  });
});
