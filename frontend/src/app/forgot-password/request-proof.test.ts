import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';

const mocks = vi.hoisted(() => ({ api: vi.fn() }));
vi.mock('@/lib/api', () => ({ api: mocks.api }));

import { requestPasswordReset } from './actions';

function form(email: string): FormData {
  const data = new FormData();
  data.set('email', email);
  return data;
}

describe('password reset request provenance', () => {
  beforeEach(() => vi.resetAllMocks());

  it('never infers a reset request from a forged query parameter', () => {
    const page = readFileSync(new URL('./page.tsx', import.meta.url), 'utf8');
    expect(page).not.toContain("params.sent === '1'");
    expect(page).not.toContain('searchParams');
    expect(page).toContain('PasswordResetRequestForm');
  });

  it('exposes accessible feedback only from the action state and never from URL state', () => {
    const formSource = readFileSync(new URL('./request-form.tsx', import.meta.url), 'utf8');
    expect(formSource).toContain('useActionState(requestPasswordReset, IDLE)');
    expect(formSource).toContain('role="status"');
    expect(formSource).toContain('aria-live="polite"');
    expect(formSource).toContain('!pending');
    expect(formSource).toContain('disabled={pending}');
    expect(formSource).toContain('min-h-11');
    expect(formSource).not.toContain('window.location');
  });

  it('accepts only the backend non-enumerating acceptance contract', async () => {
    mocks.api.mockResolvedValue({ accepted: true });
    const result = await requestPasswordReset({ status: 'idle' }, form('  SOMEONE@example.com  '));
    expect(result.status).toBe('accepted');
    expect(mocks.api).toHaveBeenCalledWith(
      '/api/v1/auth/local/password-reset/request',
      { method: 'POST', body: { email: 'SOMEONE@example.com' } },
    );
    expect(JSON.stringify(result)).not.toContain('SOMEONE@example.com');
  });

  it.each([undefined, null, {}, [], { accepted: false }, { accepted: true, sent: false }, { accepted: 'true' }])(
    'does not claim acceptance for an invalid API response: %s',
    async (response) => {
      mocks.api.mockResolvedValue(response);
      const result = await requestPasswordReset({ status: 'idle' }, form('someone@example.com'));
      expect(result.status).toBe('unavailable');
    },
  );

  it('distinguishes backend outages from accepted requests without account enumeration', async () => {
    mocks.api.mockRejectedValue(new Error('503 internal secret'));
    const result = await requestPasswordReset({ status: 'idle' }, form('someone@example.com'));
    expect(result.status).toBe('unavailable');
    expect(JSON.stringify(result)).not.toContain('503 internal secret');
  });

  it.each(['', 'invalid-email', 'x'.repeat(250) + '@example.com'])(
    'rejects invalid input without contacting the API: %s',
    async (email) => {
      const result = await requestPasswordReset({ status: 'idle' }, form(email));
      expect(result.status).toBe('invalid');
      expect(mocks.api).not.toHaveBeenCalled();
    },
  );
});
