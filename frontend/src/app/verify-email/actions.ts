'use server';

import { redirect } from 'next/navigation';
import { api, apiWithCookie } from '@/lib/api';
import { relaySetCookie } from '@/lib/cookie-relay';

export async function completeEmailVerification(formData: FormData): Promise<void> {
  const token = String(formData.get('token') ?? '').trim();
  if (token.length < 32 || token.length > 512) {
    redirect('/verify-email?status=invalid');
  }

  try {
    const { csrfToken } = await api<{ csrfToken: string }>('/api/v1/auth/session');
    const { setCookie } = await apiWithCookie<{
      outcome: 'signed-in';
      csrfToken: string;
      consentCurrent: boolean;
    }>('/api/v1/auth/local/verify-email', {
      method: 'POST',
      csrfToken,
      body: { token },
    });
    await relaySetCookie(setCookie);
  } catch {
    redirect('/verify-email?status=failed');
  }

  redirect('/?registration=verified');
}
