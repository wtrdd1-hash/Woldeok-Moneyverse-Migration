'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { ActionState } from '@/lib/action-state';
import { api, apiWithCookie } from '@/lib/api';
import { relaySetCookie } from '@/lib/cookie-relay';
import { failure, idempotencyKey, mutate } from '@/lib/mutate';

const PROVIDERS = new Set(['discord', 'google']);

/**
 * Begins linking another sign-in method.
 *
 * The API builds the authorisation URL and stores the challenge with the
 * purpose `link`; the callback reads that stored purpose, so nothing in the
 * return trip can turn this into a login for a different account.
 */
export async function startLink(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const provider = String(formData.get('provider') ?? '');
  if (!PROVIDERS.has(provider)) return { status: 'error', message: '제공자를 확인할 수 없어요.' };

  let authorizationUrl: string;
  try {
    ({ authorizationUrl } = await mutate<{ authorizationUrl: string }>(
      `/api/v1/account/identities/${provider}/link`,
    ));
  } catch (error) {
    return failure(error, '지금은 로그인 수단을 연결할 수 없어요.');
  }
  redirect(authorizationUrl);
}

/**
 * Begins step-up reauthentication, which unlocks unlinking and deletion for
 * a short window. The window is the API's to enforce; this only starts it.
 */
export async function startReauthentication(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const provider = String(formData.get('provider') ?? '');
  if (!PROVIDERS.has(provider)) return { status: 'error', message: '제공자를 확인할 수 없어요.' };

  let authorizationUrl: string;
  try {
    ({ authorizationUrl } = await mutate<{ authorizationUrl: string }>(
      `/api/v1/auth/${provider}/reauthentication`,
    ));
  } catch (error) {
    return failure(error, '지금은 본인 확인을 시작할 수 없어요.');
  }
  redirect(authorizationUrl);
}

export async function unlinkIdentity(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const identityId = String(formData.get('identityId') ?? '');
  if (identityId === '') return { status: 'error', message: '해제할 로그인 수단을 확인할 수 없어요.' };

  try {
    await mutate(`/api/v1/account/identities/${encodeURIComponent(identityId)}`, {
      method: 'DELETE',
    });
    revalidatePath('/account');
    return { status: 'ok', message: '로그인 수단 연결을 해제했어요.' };
  } catch (error) {
    // 403 here almost always means the reauthentication window has closed,
    // which is a different instruction from "you may not do this".
    return failure(error, '해제하지 못했어요. 본인 확인을 먼저 완료해 주세요.');
  }
}

export async function createPrivacyRequest(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const requestType = String(formData.get('requestType') ?? '');
  const detail = String(formData.get('detail') ?? '').trim();

  if (requestType === '') return { status: 'error', message: '요청 종류를 선택해 주세요.' };
  if (requestType === 'correction' && detail === '') {
    return { status: 'error', message: '정정 요청은 간단한 설명이 필요해요.' };
  }
  if (detail.length > 2000) {
    return { status: 'error', message: '설명은 2000자 이내로 적어 주세요.' };
  }

  try {
    await mutate('/api/v1/privacy/requests', {
      body: {
        requestType,
        ...(detail === '' ? {} : { detail }),
        idempotencyKey: idempotencyKey(),
      },
    });
    revalidatePath('/account');
    return { status: 'ok', message: '요청을 접수 기록으로 남겼어요.' };
  } catch (error) {
    return failure(error, '지금은 요청을 기록할 수 없어요.');
  }
}

/**
 * Requests account deletion, then ends the session.
 *
 * The API answers 202 and moves the account to a deleted state; every session
 * is revoked as part of that. Signing out here as well is what stops the
 * browser holding a cookie for an account that no longer accepts it.
 */
export async function deleteAccount(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (formData.get('confirm') !== 'on') {
    return { status: 'error', message: '안내를 읽고 확인란을 선택해 주세요.' };
  }

  try {
    await mutate('/api/v1/account', { method: 'DELETE' });
  } catch (error) {
    return failure(error, '삭제하지 못했어요. 본인 확인을 먼저 완료해 주세요.');
  }

  try {
    const { csrfToken } = await api<{ csrfToken: string }>('/api/v1/auth/session');
    const { setCookie } = await apiWithCookie<null>('/api/v1/auth/logout', {
      method: 'POST',
      csrfToken,
    });
    await relaySetCookie(setCookie);
  } catch {
    // The account is already gone; a session that outlives it is refused by
    // every route anyway.
  }
  redirect('/?account=deleted');
}
