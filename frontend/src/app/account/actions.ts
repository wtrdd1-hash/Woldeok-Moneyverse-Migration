'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { ActionState } from '@/lib/action-state';
import { api, apiWithCookie } from '@/lib/api';
import { relaySetCookie } from '@/lib/cookie-relay';
import { failure, mutate } from '@/lib/mutate';

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

const PRIVACY_REQUEST_TYPES = new Set(['access', 'correction', 'restriction', 'withdrawal', 'deletion']);
const PRIVACY_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface PrivacyReceipt {
  readonly requestId: string;
  readonly requestType: string;
  readonly status: string;
  readonly replayed: boolean;
}

export async function createPrivacyRequest(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const requestType = String(formData.get('requestType') ?? '');
  const detail = String(formData.get('detail') ?? '').trim();
  const requestKey = String(formData.get('idempotencyKey') ?? '');

  if (!PRIVACY_REQUEST_TYPES.has(requestType)) {
    return { status: 'error', message: '요청 종류를 다시 선택해 주세요.' };
  }
  if (!PRIVACY_UUID.test(requestKey)) {
    return { status: 'error', message: '요청 식별자가 유효하지 않습니다. 페이지를 새로고침해 주세요.' };
  }
  if (requestType === 'correction' && detail === '') {
    return { status: 'error', message: '정정 요청은 간단한 설명이 필요해요.' };
  }
  if (detail.length > 1000) {
    return { status: 'error', message: '설명은 1000자 이내로 적어 주세요.' };
  }

  try {
    const receipt = await mutate<PrivacyReceipt>('/api/v1/privacy/requests', {
      body: {
        requestType,
        ...(detail === '' ? {} : { detail }),
        idempotencyKey: requestKey,
      },
    });
    // Never claim a request was recorded unless the authoritative API
    // returns a receipt for this exact request. A timeout is indeterminate.
    if (
      !receipt ||
      !PRIVACY_UUID.test(receipt.requestId) ||
      receipt.requestType !== requestType ||
      receipt.status !== 'received' ||
      typeof receipt.replayed !== 'boolean'
    ) {
      return { status: 'error', message: '접수 결과를 확인하지 못했습니다. 내 요청 기록을 확인한 뒤 다시 시도해 주세요.' };
    }
    revalidatePath('/account');
    revalidatePath('/account/privacy');
    return {
      status: 'ok',
      message: `개인정보 요청이 접수 기록에 저장되었습니다. 접수번호: ${receipt.requestId}. 실제 처리 완료를 뜻하지 않습니다.`,
    };
  } catch (error) {
    const result = failure(error, '접수 결과를 확인하지 못했습니다. 내 요청 기록을 확인한 뒤 같은 요청을 다시 시도해 주세요.');
    return result.status === 'error'
      ? { ...result, message: `${result.message} 처리 여부가 불확실하면 내 요청 기록을 먼저 확인해 주세요.` }
      : result;
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
