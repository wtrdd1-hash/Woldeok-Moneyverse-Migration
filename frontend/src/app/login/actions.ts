'use server';

import { redirect } from 'next/navigation';
import type { ActionState } from '@/lib/action-state';
import { api, apiWithCookie } from '@/lib/api';
import { relaySetCookie, sessionCookiePair } from '@/lib/cookie-relay';
import { failure } from '@/lib/mutate';

/**
 * Records the pre-login acknowledgement, creating the session it is recorded
 * against if there is not one yet.
 *
 * Three calls in one action, and the order matters. The session has to exist
 * before there is a CSRF token to spend, and the token has to be spent as
 * *that* session — which is why the second call sends the cookie explicitly
 * rather than reading the caller's: the browser has not been given it yet,
 * and will not be until this response is written.
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
  const termsVersion = String(formData.get('termsVersion') ?? '');
  const privacyVersion = String(formData.get('privacyVersion') ?? '');

  if (termsVersion === '' || privacyVersion === '') {
    return { status: 'error', message: '정책 버전을 확인할 수 없어요. 새로고침 후 다시 시도해 주세요.' };
  }
  if (
    formData.get('terms') !== 'on' ||
    formData.get('privacy') !== 'on' ||
    formData.get('age') !== 'on'
  ) {
    return { status: 'error', message: '세 항목을 모두 확인해 주세요.' };
  }

  try {
    const { payload, setCookie } = await apiWithCookie<{
      signedIn: boolean;
      csrfToken: string | null;
    }>('/api/v1/auth/prelogin-session', { method: 'POST' });

    await relaySetCookie(setCookie);
    if (payload.signedIn) redirect('/');
    if (!payload.csrfToken) {
      return { status: 'error', message: '로그인 세션을 시작하지 못했어요. 잠시 후 다시 시도해 주세요.' };
    }

    await api('/api/v1/auth/consent', {
      method: 'PUT',
      csrfToken: payload.csrfToken,
      body: { termsCompleted: true, privacyCompleted: true, ageConfirmed: true, termsVersion, privacyVersion },
      ...(sessionCookiePair(setCookie) === null
        ? {}
        : { cookieHeader: sessionCookiePair(setCookie) as string }),
    });
  } catch (error) {
    // `redirect` works by throwing; rethrow so Next can act on it.
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') throw error;
    return failure(error, '동의를 기록하지 못했어요. 잠시 후 다시 시도해 주세요.');
  }

  redirect('/login/providers');
}
