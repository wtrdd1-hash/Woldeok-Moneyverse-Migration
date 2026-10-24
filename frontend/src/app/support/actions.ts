'use server';

import { createHash } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { api } from '@/lib/api';

export type SupportActionState = { readonly error: string | null; readonly fingerprint?: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const RETRY_ERROR = '접수 결과를 확인하지 못했습니다. 내용을 바꾸지 말고 다시 시도해 주세요. 변경하려면 페이지를 새로고침해 주세요.';
const INVALID_ERROR = '요청 정보를 확인할 수 없습니다. 페이지를 새로고침한 후 다시 작성해 주세요.';

async function csrf(): Promise<string> {
  const response = await api<{ csrfToken: string }>('/api/v1/auth/session');
  if (!response || typeof response.csrfToken !== 'string' || !response.csrfToken) {
    throw new Error('CSRF token is unavailable');
  }
  return response.csrfToken;
}
function text(value: FormDataEntryValue | null): string { return typeof value === 'string' ? value.trim() : ''; }
function isUuid(value: string): boolean { return UUID.test(value); }

export async function createSupportThread(previous: SupportActionState, formData: FormData): Promise<SupportActionState> {
  const idempotencyKey = text(formData.get('idempotencyKey'));
  const subject = text(formData.get('subject'));
  const body = text(formData.get('body'));
  if (!isUuid(idempotencyKey) || !subject || subject.length > 120 || !body || body.length > 2000) {
    return { error: INVALID_ERROR };
  }
  // The existing database create function returns an old receipt for a reused key.
  // Fence changed payloads after an uncertain response rather than claiming a different message was submitted.
  const fingerprint = createHash('sha256').update(JSON.stringify([idempotencyKey, subject, body])).digest('hex');
  if (previous.fingerprint && previous.fingerprint !== fingerprint) return { error: INVALID_ERROR, fingerprint: previous.fingerprint };
  let threadId: string;
  try {
    const result = await api<{ thread?: { thread_id?: string } }>('/api/v1/support/threads', {
      method: 'POST', csrfToken: await csrf(), body: { subject, body, idempotencyKey },
    });
    if (!result?.thread || typeof result.thread.thread_id !== 'string' || !isUuid(result.thread.thread_id)) {
      return { error: RETRY_ERROR, fingerprint };
    }
    threadId = result.thread.thread_id;
  } catch {
    return { error: RETRY_ERROR, fingerprint };
  }
  revalidatePath('/support');
  // Redirect creates a new form key; only a verified server receipt can end a retry window.
  redirect(`/support?thread=${threadId}`);
}

export async function replySupportThread(_previous: SupportActionState, formData: FormData): Promise<SupportActionState> {
  const idempotencyKey = text(formData.get('idempotencyKey'));
  const threadId = text(formData.get('threadId'));
  const body = text(formData.get('body'));
  if (!isUuid(idempotencyKey) || !isUuid(threadId) || !body || body.length > 2000) {
    return { error: INVALID_ERROR };
  }
  try {
    const result = await api<{ message?: { message_id?: string; sender_kind?: string; body?: string } }>(
      `/api/v1/support/threads/${threadId}/messages`, {
        method: 'POST', csrfToken: await csrf(), body: { body, idempotencyKey },
      },
    );
    if (!result?.message || !isUuid(result.message.message_id ?? '') ||
        result.message.sender_kind !== 'user' || result.message.body !== body) {
      return { error: RETRY_ERROR };
    }
  } catch {
    return { error: RETRY_ERROR };
  }
  revalidatePath('/support');
  redirect(`/support?thread=${threadId}`);
}
