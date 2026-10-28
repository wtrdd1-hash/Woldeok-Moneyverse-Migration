'use server';

import { redirect } from 'next/navigation';
import { ApiError, apiWithCookie } from '@/lib/api';
import { relaySetCookie } from '@/lib/cookie-relay';
import { hasVerifiedEmailActivationReceipt } from './verified-activation';

export async function completeEmailVerification(formData: FormData): Promise<void> {
  const token = String(formData.get('token') ?? '').trim();
  if (token.length < 32 || token.length > 512) {
    redirect('/verify-email?status=invalid');
  }

  let confirmed = false;
  try {
    const { payload, setCookie } = await apiWithCookie<unknown>('/api/v1/auth/local/verify-email', {
      method: 'POST',
      body: { token },
    });
    if (hasVerifiedEmailActivationReceipt(payload, setCookie)) {
      await relaySetCookie(setCookie);
      confirmed = true;
    }
  } catch (error) {
    // A network failure or cookie-relay failure may happen after the one-time
    // token was consumed. Never tell the member to register again in that case.
    if (error instanceof ApiError && error.status === 401) {
      redirect('/verify-email?status=failed');
    }
    redirect('/verify-email?status=unconfirmed');
  }

  if (!confirmed) redirect('/verify-email?status=unconfirmed');
  redirect('/?registration=verified');
}
