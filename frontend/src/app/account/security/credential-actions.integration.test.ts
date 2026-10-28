import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ mutate: vi.fn(), revalidatePath: vi.fn() }));
vi.mock('@/lib/mutate', () => ({ mutate: mocks.mutate }));
vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock('next/navigation', () => ({ redirect: (url: string) => { throw new Error(`redirect:${url}`); } }));
vi.mock('@/lib/api', () => ({ api: vi.fn(), apiWithCookie: vi.fn() }));
vi.mock('@/lib/cookie-relay', () => ({ relaySetCookie: vi.fn() }));

import { changeLocalPassword, reauthenticateWithLocalPassword, requestLocalEmailChange } from './actions';

const form = (values: Record<string, string>): FormData => {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
};

beforeEach(() => { mocks.mutate.mockReset(); mocks.revalidatePath.mockReset(); });

describe('security actions reject unverified successful HTTP responses', () => {
  it('does not claim reauthentication when outcome is missing', async () => {
    mocks.mutate.mockResolvedValue({});
    await expect(reauthenticateWithLocalPassword(form({ email: 'a@example.com', password: 'secret' })))
      .rejects.toThrow('redirect:/account/security?error=local-reauth');
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });
  it('allows confirmed reauthentication', async () => {
    mocks.mutate.mockResolvedValue({ outcome: 'reauthenticated' });
    await expect(reauthenticateWithLocalPassword(form({ email: 'a@example.com', password: 'secret' })))
      .rejects.toThrow('redirect:/account/security?reauth=done');
  });
  it('does not claim password change for a contradictory receipt', async () => {
    mocks.mutate.mockResolvedValue({ outcome: 'not-changed' });
    await expect(changeLocalPassword(form({ password: 'a-long-password', confirmPassword: 'a-long-password' })))
      .rejects.toThrow('redirect:/account/security?error=password-change');
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });
  it('allows verified password change', async () => {
    mocks.mutate.mockResolvedValue({ outcome: 'password-changed' });
    await expect(changeLocalPassword(form({ password: 'a-long-password', confirmPassword: 'a-long-password' })))
      .rejects.toThrow('redirect:/account/security?password=changed');
  });
  it('does not claim email verification request with partial evidence', async () => {
    mocks.mutate.mockResolvedValue({ accepted: true, verificationRequired: false });
    await expect(requestLocalEmailChange(form({ email: 'new@example.com' })))
      .rejects.toThrow('redirect:/account/security?error=email-change');
  });
  it('allows verified email change request', async () => {
    mocks.mutate.mockResolvedValue({ accepted: true, verificationRequired: true });
    await expect(requestLocalEmailChange(form({ email: 'new@example.com' })))
      .rejects.toThrow('redirect:/account/security?email=verification-sent');
  });
});
