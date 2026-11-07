'use server';

import { api } from '@/lib/api';

export type PasswordResetRequestState = {
  readonly status: 'idle' | 'invalid' | 'accepted' | 'unavailable';
};

/**
 * Nest deliberately returns the same acceptance for existing and unknown
 * addresses. This is a request receipt, never evidence that email was sent.
 */
export async function requestPasswordReset(
  _previous: PasswordResetRequestState,
  formData: FormData,
): Promise<PasswordResetRequestState> {
  const field = formData.get('email');
  const email = typeof field === 'string' ? field.trim() : '';
  if (
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) return { status: 'invalid' };

  try {
    const receipt: unknown = await api('/api/v1/auth/local/password-reset/request', {
      method: 'POST',
      body: { email },
    });
    if (
      receipt !== null &&
      typeof receipt === 'object' &&
      !Array.isArray(receipt) &&
      Object.keys(receipt).length === 1 &&
      (receipt as { accepted?: unknown }).accepted === true
    ) return { status: 'accepted' };
  } catch {
    // Do not leak upstream diagnostics or the existence of an account.
  }
  return { status: 'unavailable' };
}
