'use server';

import { redirect } from 'next/navigation';
import { ApiError, api, apiWithCookie, apiOrNull } from '@/lib/api';
import { relaySetCookie, sessionCookiePair } from '@/lib/cookie-relay';

export async function submitLocalRegister(formData: FormData): Promise<never> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const displayName = String(formData.get('displayName') ?? '').trim();

  if (email === '' || password === '' || displayName === '') {
    redirect('/register?error=missing_fields');
  }

  if (displayName.length < 2 || displayName.length > 20) {
    redirect('/register?error=invalid_display_name');
  }

  if (password.length < 8) {
    redirect('/register?error=weak_password');
  }

  try {
    const { payload: prelogin, setCookie: preloginCookies } = await apiWithCookie<{
      signedIn: boolean;
      csrfToken: string;
    }>('/api/v1/auth/prelogin-session', { method: 'POST' });

    await relaySetCookie(preloginCookies);
    const freshCookieHeader = sessionCookiePair(preloginCookies);

    const policy = await apiOrNull<{ termsVersion: string; privacyVersion: string }>(
      '/api/v1/auth/policy',
    );

    if (policy) {
      await api('/api/v1/auth/consent', {
        method: 'PUT',
        csrfToken: prelogin.csrfToken,
        body: {
          termsCompleted: true,
          privacyCompleted: true,
          ageConfirmed: true,
          termsVersion: policy.termsVersion,
          privacyVersion: policy.privacyVersion,
        },
        ...(freshCookieHeader ? { cookieHeader: freshCookieHeader } : {}),
      });
    }

    const { payload: regResult } = await apiWithCookie<{
      accepted: boolean;
      verificationRequired: boolean;
      verificationToken?: string;
    }>('/api/v1/auth/local/register', {
      method: 'POST',
      csrfToken: prelogin.csrfToken,
      body: { email, password, displayName },
      ...(freshCookieHeader ? { cookieHeader: freshCookieHeader } : {}),
    });

    if (regResult.verificationToken) {
      redirect(`/verify-email?token=${encodeURIComponent(regResult.verificationToken)}&registered=1`);
    } else {
      redirect('/register?success=1');
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') throw error;
    if (error instanceof ApiError && error.status === 400) {
      redirect('/register?error=bad_request');
    }
    if (error instanceof ApiError && error.status === 409) {
      redirect('/register?error=email_conflict');
    }
    if (error instanceof ApiError && error.status === 403) {
      redirect('/register?error=policy_or_password_violation');
    }
    redirect('/register?error=registration_failed');
  }
}
