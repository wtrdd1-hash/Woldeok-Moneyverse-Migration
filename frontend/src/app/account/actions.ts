'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { ActionState } from '@/lib/action-state';
import { api, apiWithCookie } from '@/lib/api';
import { relaySetCookie } from '@/lib/cookie-relay';
import { failure, idempotencyKey, mutate } from '@/lib/mutate';

const PROVIDERS = new Set(['discord', 'google']);
const PRIVACY_REQUEST_TYPES = new Set(['access', 'correction', 'restriction', 'withdrawal', 'deletion']);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ISO_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

interface PrivacyRequestReceipt {
  readonly requestId: string;
  readonly requestType: string;
  readonly status: 'received';
  readonly createdAt: string;
  readonly replayed: boolean;
}

function verifiedPrivacyReceipt(value: unknown, requestedType: string): PrivacyRequestReceipt | null {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return null;
  const receipt = value as Record<string, unknown>;
  if (
    typeof receipt.requestId !== 'string' || !UUID.test(receipt.requestId) ||
    receipt.requestType !== requestedType || receipt.status !== 'received' ||
    typeof receipt.replayed !== 'boolean' ||
    typeof receipt.createdAt !== 'string' || !ISO_TIME.test(receipt.createdAt) ||
    !Number.isFinite(Date.parse(receipt.createdAt)) ||
    new Date(receipt.createdAt).toISOString() !== receipt.createdAt
  ) return null;
  return receipt as unknown as PrivacyRequestReceipt;
}

function ownerPrivacyReadbackMatches(value: unknown, receipt: PrivacyRequestReceipt): boolean {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const requests = (value as { requests?: unknown }).requests;
  if (!Array.isArray(requests)) return false;
  return requests.some((entry: unknown) => {
    if (entry === null || typeof entry !== 'object' || Array.isArray(entry)) return false;
    const row = entry as Record<string, unknown>;
    return row.requestId === receipt.requestId && row.requestType === receipt.requestType &&
      row.status === receipt.status && row.createdAt === receipt.createdAt;
  });
}


/** A successful HTTP status alone does not prove persistence. */
function verifiedAccountDeletionReceipt(value: unknown): void {
  if (typeof value !== 'object' || value === null || !('deletedAt' in value) ||
      !('revokedSessionCount' in value) || !('replayed' in value)) {
    throw new Error('missing deletion receipt');
  }
  const { deletedAt, revokedSessionCount, replayed } = value;
  if (typeof deletedAt !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(deletedAt) ||
      !Number.isFinite(Date.parse(deletedAt)) ||
      new Date(deletedAt).toISOString() !== deletedAt ||
      !Number.isSafeInteger(revokedSessionCount) ||
      (revokedSessionCount as number) < 0 || typeof replayed !== 'boolean') {
    throw new Error('invalid deletion receipt');
  }
}


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

  if (!PRIVACY_REQUEST_TYPES.has(requestType)) return { status: 'error', message: '요청 종류를 다시 선택해 주세요.' };
  if (requestType === 'correction' && detail === '') {
    return { status: 'error', message: '정정 요청은 간단한 설명이 필요해요.' };
  }
  if (detail.length > 2000) {
    return { status: 'error', message: '설명은 2000자 이내로 적어 주세요.' };
  }

  try {
    const result = await mutate<unknown>('/api/v1/privacy/requests', {
      body: {
        requestType,
        ...(detail === '' ? {} : { detail }),
        idempotencyKey: idempotencyKey(),
      },
    });
    const receipt = verifiedPrivacyReceipt(result, requestType);
    if (receipt === null) {
      return { status: 'error', message: '접수 여부를 확인할 수 없어요. 요청 기록을 확인한 뒤 다시 시도해 주세요.' };
    }
    // A mutation receipt alone cannot prove that the owner-facing list exposes the stored row.
    let readback: unknown;
    try {
      readback = await api<unknown>('/api/v1/privacy/requests');
    } catch {
      return { status: 'error', message: '접수 여부를 다시 확인할 수 없어요. 요청 기록을 확인해 주세요.' };
    }
    if (!ownerPrivacyReadbackMatches(readback, receipt)) {
      return { status: 'error', message: '접수 기록을 확인할 수 없어요. 요청 기록을 확인해 주세요.' };
    }
    revalidatePath('/account');
    revalidatePath('/account/privacy');
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
    const receipt = await mutate<unknown>('/api/v1/account', { method: 'DELETE' });
    verifiedAccountDeletionReceipt(receipt);
  } catch (error) {
    return failure(error, '계정 삭제 완료 여부를 확인할 수 없습니다. 다시 삭제 요청하지 말고 로그인 상태를 확인해 주세요.');
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
