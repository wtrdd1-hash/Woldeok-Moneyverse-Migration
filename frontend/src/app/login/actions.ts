'use server';

import { redirect } from 'next/navigation';
import type { ActionState } from '@/lib/action-state';
import { ApiError, api, apiWithCookie } from '@/lib/api';
import { relaySetCookie, sessionCookiePair } from '@/lib/cookie-relay';
import { failure } from '@/lib/mutate';

/**
 * Signs a first-party account in through the same API/session boundary used by OAuth.
 *
 * A signed-out browser may not have a pre-login session yet, so the action first
 * creates/reuses one, relays its cookie, then submits the email/password with the
 * API-issued CSRF token. The browser never receives the internal API token and the
 * password is never persisted by the frontend.
 */
export async function submitLocalLogin(formData: FormData): Promise<never> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (email === '' || password === '') {
    redirect('/login?error=local_fields');
  }

  try {
    const { payload: prelogin, setCookie: preloginCookies } = await apiWithCookie<{
      signedIn: boolean;
      csrfToken: string;
    }>('/api/v1/auth/prelogin-session', { method: 'POST' });

    await relaySetCookie(preloginCookies);
    const freshCookieHeader = sessionCookiePair(preloginCookies);

    const { payload: login, setCookie: loginCookies } = await apiWithCookie<{
      outcome: 'signed-in';
      csrfToken: string;
      consentCurrent: boolean;
    }>('/api/v1/auth/local/login', {
      method: 'POST',
      csrfToken: prelogin.csrfToken,
      body: { email, password },
      ...(freshCookieHeader ? { cookieHeader: freshCookieHeader } : {}),
    });

    await relaySetCookie(loginCookies);
    redirect(login.consentCurrent ? '/' : '/login');
  } catch (error) {
    // `redirect` works by throwing; never translate a successful redirect into
    // a login failure message.
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') throw error;
    if (error instanceof ApiError && error.status === 401) {
      redirect('/login?error=local_credentials');
    }
    if (error instanceof ApiError && error.status === 503) {
      redirect('/login?error=local_unavailable');
    }
    redirect('/login?error=local_login');
  }
}

/**
 * Records the authenticated member acknowledgement after OAuth identification.
 *
 * The version pair comes from the form, not from a fresh read. It names the
 * documents the member actually scrolled through; if the published policy has
 * moved on since the page rendered, the API answers 409 and the member is
 * asked again — which is the correct outcome, not a bug to route around.
 */
export async function submitConsent(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  let next: '/';
  const termsVersion = String(formData.get('termsVersion') ?? '');
  const privacyVersion = String(formData.get('privacyVersion') ?? '');

  if (termsVersion === '' || privacyVersion === '') {
    return {
      status: 'error',
      message: '정책 버전을 확인할 수 없어요. 새로고침 후 다시 시도해 주세요.',
    };
  }
  if (
    formData.get('terms') !== 'on' ||
    formData.get('privacy') !== 'on' ||
    formData.get('age') !== 'on'
  ) {
    return { status: 'error', message: '세 항목을 모두 확인해 주세요.' };
  }

  try {
    const { csrfToken } = await api<{ csrfToken: string }>('/api/v1/auth/session');
    ({ next } = await api<{ next: '/' }>('/api/v1/auth/consent', {
      method: 'PUT',
      csrfToken,
      body: {
        termsCompleted: true,
        privacyCompleted: true,
        ageConfirmed: true,
        termsVersion,
        privacyVersion,
      },
    }));
  } catch (error) {
    // `redirect` works by throwing; rethrow so Next can act on it.
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') throw error;
    return failure(error, '동의를 기록하지 못했어요. 잠시 후 다시 시도해 주세요.');
  }

  redirect(next);
}
