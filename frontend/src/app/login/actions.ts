'use server';

import { redirect } from 'next/navigation';
import type { ActionState } from '@/lib/action-state';
import { api } from '@/lib/api';
import { failure } from '@/lib/mutate';

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
