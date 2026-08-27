import 'server-only';

import { randomUUID } from 'node:crypto';
import { ApiError, api } from './api';
import type { ActionState } from './action-state';

/**
 * The write path.
 *
 * Every mutation in this application starts here, and the reason is the CSRF
 * token. The original planted a freshly rotated token into each server-
 * rendered page; nothing equivalent exists when the browser holds only HTML
 * from Next. So the token is never given to the browser at all — a server
 * action fetches one for itself and spends it in the same call, which keeps
 * the original's "one token, one write" property without the token ever
 * crossing the network to a client.
 */
export async function mutate<T>(
  path: string,
  request: {
    readonly method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    readonly body?: unknown;
  } = {},
): Promise<T> {
  const { csrfToken } = await api<{ csrfToken: string }>('/api/v1/auth/session');
  return api<T>(path, { method: request.method ?? 'POST', body: request.body, csrfToken });
}

/**
 * Turns whatever went wrong into something a member can act on.
 *
 * The API speaks RFC 9457 and its `detail` is written for an operator, in
 * English, and sometimes names an internal constraint. Only the status is
 * reliably meaningful to a reader, so the status decides the sentence.
 */
export function failure(error: unknown, fallback: string): ActionState {
  if (error instanceof ApiError) {
    if (error.status === 401) return { status: 'error', message: '로그인이 필요해요.' };
    if (error.status === 403) {
      return { status: 'error', message: '이 작업을 수행할 권한이 없어요.' };
    }
    if (error.status === 404) return { status: 'error', message: '대상을 찾을 수 없어요.' };
    if (error.status === 409) return { status: 'error', message: fallback };
    if (error.status === 422 || error.status === 400) {
      return { status: 'error', message: '입력한 내용을 다시 확인해 주세요.' };
    }
    if (error.status === 429) {
      return { status: 'error', message: '요청이 너무 잦아요. 잠시 후 다시 시도해 주세요.' };
    }
    if (error.status >= 500) {
      return { status: 'error', message: '서비스가 일시적으로 불안정해요. 잠시 후 다시 시도해 주세요.' };
    }
  }
  return { status: 'error', message: fallback };
}

/**
 * A fresh idempotency key for one submission.
 *
 * Generated on the server, per attempt. Every money-moving database function
 * takes one and returns the original receipt for a repeat, so the key is what
 * makes a double-submitted form charge once.
 */
export function idempotencyKey(): string {
  return randomUUID();
}

/**
 * Reads a positive whole number out of a form field.
 *
 * Amounts are integers of WLD and the API rejects anything else; catching it
 * here means the member is told which field is wrong instead of receiving a
 * validation document about a DTO.
 */
export function wholeAmount(value: FormDataEntryValue | null): number | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.replaceAll(',', '').trim();
  if (!/^[0-9]+$/.test(trimmed)) return null;
  const parsed = Number(trimmed);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) return null;
  return parsed;
}

export type { ActionState };
export { IDLE } from './action-state';
