import { describe, expect, it, vi } from 'vitest';
import { LocalAuthController } from './local-auth.controller';

describe('LocalAuthController.changePassword', () => {
  it('changes the local password for the authenticated user', async () => {
    const credentials = { changePassword: vi.fn().mockResolvedValue(true) };
    const controller = new LocalAuthController({} as never, {} as never, credentials as never, {} as never);
    const request = { session: { id: '11111111-1111-4111-8111-111111111111', user_id: '22222222-2222-4222-8222-222222222222' } } as never;
    await expect(controller.changePassword(request, { password: 'a-new-unique-password' })).resolves.toEqual({ outcome: 'password-changed' });
    expect(credentials.changePassword).toHaveBeenCalledWith('11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222', expect.any(String));
  });
});
