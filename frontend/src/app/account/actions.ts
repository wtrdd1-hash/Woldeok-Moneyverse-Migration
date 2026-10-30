'use server';

/** A successful HTTP status alone does not prove persistence. */
function verifiedAccountDeletionReceipt(value: unknown): void {
  if (typeof value !== 'object' || value === null || !('deletedAt' in value) ||
      !('revokedSessionCount' in value) || !('replayed' in value)) {
    throw new Error('missing deletion receipt');
  }
  const { deletedAt, revokedSessionCount, replayed } = value as Record<string, unknown>;
  if (typeof deletedAt !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(deletedAt) ||
      !Number.isFinite(Date.parse(deletedAt)) ||
      new Date(deletedAt).toISOString() !== deletedAt ||
      !Number.isSafeInteger(revokedSessionCount) ||
      (revokedSessionCount as number) < 0 || typeof replayed !== 'boolean') {
    throw new Error('invalid deletion receipt');
  }
}

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { ActionState } from '@/lib/action-state';
import { api, apiWithCookie } from '@/lib/api';
import { relaySetCookie } from '@/lib/cookie-relay';
import { failure, idempotencyKey, mutate } from '@/lib/mutate';

const PROVIDERS = new Set(['discord', 'google']);
const UNLINK_IDENTITY_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
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

/**
 * Removes a linked OAuth identity.
 *
 * Refused if it is the only sign-in method, or if the user has not completed
 * step-up reauthentication within the required window.
 */
export async function unlinkIdentity(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const identityId = String(formData.get('identityId') ?? '');
  if (!UNLINK_IDENTITY_UUID.test(identityId)) {
    return { status: 'error', message: '연결을 해제할 로그인 수단을 확인할 수 없어요.' };
  }

  let receipt: unknown;
  try {
    receipt = await mutate(`/api/v1/account/identities/${identityId}`, {
      method: 'DELETE',
    });
  } catch (error) {
    return failure(error, '해제하지 못했어요. 본인 확인을 먼저 완료해 주세요.');
  }

  if (
    typeof receipt !== 'object' ||
    receipt === null ||
    !('identityId' in receipt) ||
    (receipt as { identityId: unknown }).identityId !== identityId
  ) {
    return { status: 'error', message: '로그인 수단 해제 영수증을 확인할 수 없어요.' };
  }

  let readback: unknown;
  try {
    readback = await api<unknown>('/api/v1/account/identities');
  } catch {
    return { status: 'error', message: '해제 후 로그인 수단 목록을 확인할 수 없어요.' };
  }

  if (
    typeof readback !== 'object' ||
    readback === null ||
    !('identities' in readback) ||
    !Array.isArray((readback as { identities: unknown }).identities)
  ) {
    return { status: 'error', message: '로그인 수단 목록 응답이 올바르지 않아요.' };
  }

  const identities = (readback as { identities: Array<{ identityId?: unknown }> }).identities;
  for (const item of identities) {
    if (typeof item !== 'object' || item === null || typeof item.identityId !== 'string') {
      return { status: 'error', message: '로그인 수단 항목 형식이 올바르지 않아요.' };
    }
  }

  if (identities.some((item) => item.identityId === identityId)) {
    return { status: 'error', message: '로그인 수단이 여전히 남아있어요.' };
  }

  revalidatePath('/account');
  return { status: 'ok', message: '로그인 수단 연결을 해제했어요.' };
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
 * Permanently deletes the member's account.
 *
 * If the member has a local email identity, the user's password must be
 * provided so the server can verify the secret before initiating deletion.
 *
 * The API revokes every session and writes an audit receipt to PostgreSQL
 * in the same transaction that disables the account. The client discards
 * its own session cookie immediately — before the redirect — so a reload
 * never presents stale credentials.
 */
export async function deleteAccount(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (formData.get('confirm') !== 'on') {
    return { status: 'error', message: '안내를 읽고 확인란을 선택해 주세요.' };
  }

  const password = formData.get('password');
  const mutateOptions: { method: 'DELETE'; body?: Record<string, unknown> } = { method: 'DELETE' };
  if (typeof password === 'string' && password.length > 0) {
    mutateOptions.body = {
      confirmation: 'DELETE MY ACCOUNT',
      idempotencyKey: idempotencyKey(),
      password,
    };
  }

  try {
    const receipt = await mutate<unknown>('/api/v1/account', mutateOptions);
    verifiedAccountDeletionReceipt(receipt);
  } catch (error) {
    return failure(error, '계정 삭제 완료 여부를 확인할 수 없습니다. 다시 삭제 요청하지 말고 로그인 상태를 확인해 주세요.');
  }

  // Tell the browser to clear the session cookie, even if the user closes
  // the tab before the redirect completes.
  try {
    const { csrfToken } = await api<{ csrfToken: string }>('/api/v1/auth/session');
    const { setCookie } = await apiWithCookie<null>('/api/v1/auth/logout', {
      method: 'POST',
      csrfToken,
    });
    await relaySetCookie(setCookie);
  } catch {
    // If logout fails, proceed to redirect anyway — the backend has revoked all sessions.
  }

  redirect('/?account=deleted');
}
