import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  api: vi.fn(),
  redirect: vi.fn((path: string): never => { throw new Error(`REDIRECT:${path}`); }),
}));
vi.mock('next/navigation', () => ({ redirect: mocks.redirect }));
vi.mock('@/lib/api', () => ({ api: mocks.api }));

import { isEmailChangeReceipt } from './email-change-receipt';
import { completeLoginEmailChange } from './actions';

function form(token = 'a'.repeat(64)) {
  const data = new FormData();
  data.set('token', token);
  return data;
}

describe('verified login email change completion', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('accepts only a completed email change with session revocation evidence', () => {
    expect(isEmailChangeReceipt({ outcome: 'email-changed', sessionsRevoked: true })).toBe(true);
    for (const invalid of [null, undefined, {}, [], 'email-changed',
      { outcome: 'email-changed' },
      { outcome: 'email-changed', sessionsRevoked: false },
      { outcome: 'email-changed', sessionsRevoked: 'true' },
      { outcome: 'email-change-requested', sessionsRevoked: true },
      { outcome: 'email-changed', sessionsRevoked: true, success: false },
      { outcome: 'email-changed', sessionsRevoked: true, error: 'not-revoked' },
    ]) expect(isEmailChangeReceipt(invalid)).toBe(false);
  });

  it('shows success only after verifying the backend completion receipt', async () => {
    mocks.api.mockResolvedValue({ outcome: 'email-changed', sessionsRevoked: true });
    await expect(completeLoginEmailChange(form())).rejects.toThrow('REDIRECT:/login?email_changed=1');
    expect(mocks.api).toHaveBeenCalledWith('/api/v1/auth/local/email-change/complete', {
      method: 'POST', body: { token: 'a'.repeat(64) },
    });
  });

  it.each([undefined, null, {}, { outcome: 'email-changed', sessionsRevoked: false },
    { outcome: 'email-changed', sessionsRevoked: true, success: false },
  ])('does not claim success for malformed receipt: %s', async (receipt) => {
    mocks.api.mockResolvedValue(receipt);
    await expect(completeLoginEmailChange(form())).rejects.toThrow('REDIRECT:/verify-email-change?status=unverified');
    expect(mocks.redirect).not.toHaveBeenCalledWith('/login?email_changed=1');
  });

  it('rejects invalid token before contacting backend', async () => {
    await expect(completeLoginEmailChange(form('short'))).rejects.toThrow('REDIRECT:/verify-email-change?status=invalid');
    expect(mocks.api).not.toHaveBeenCalled();
  });

  it('does not announce success on backend transport failure', async () => {
    mocks.api.mockRejectedValue(new Error('backend unavailable'));
    await expect(completeLoginEmailChange(form())).rejects.toThrow('REDIRECT:/verify-email-change?status=failed');
  });
});
