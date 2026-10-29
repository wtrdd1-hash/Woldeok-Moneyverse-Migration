'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import type { ActionState } from '@/lib/action-state';
import { api } from '@/lib/api';

export interface SupportActionState extends ActionState {
  readonly threadId?: string;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const UNCERTAIN = '전송 여부를 확인하지 못했어요. 다시 보내기 전에 새로고침하여 문의 기록을 확인해 주세요.';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function text(value: FormDataEntryValue | null): string {
  return typeof value === 'string' ? value.trim() : '';
}

function validTime(value: unknown): boolean {
  return typeof value === 'string' && value.length > 0 && Number.isFinite(Date.parse(value));
}

async function csrf(): Promise<string> {
  const session: unknown = await api('/api/v1/auth/session');
  if (!isRecord(session) || typeof session.csrfToken !== 'string' || !session.csrfToken.trim()) {
    throw new Error('Member session not verified');
  }
  return session.csrfToken;
}

function verifiedMessage(value: unknown, body: string): value is Record<string, unknown> {
  return isRecord(value) && UUID.test(String(value.message_id ?? '')) &&
    value.sender_kind === 'user' && value.body === body && validTime(value.created_at);
}

export async function createSupportThread(
  _previous: SupportActionState,
  formData: FormData,
): Promise<SupportActionState> {
  const subject = text(formData.get('subject'));
  const body = text(formData.get('body'));
  if (!subject || subject.length > 120 || !body || body.length > 2000) {
    return { status: 'error', message: '제목(120자 이내)과 문의 내용(2000자 이내)을 입력해 주세요.' };
  }

  try {
    const receipt: unknown = await api('/api/v1/support/threads', {
      method: 'POST', csrfToken: await csrf(),
      body: { subject, body, idempotencyKey: randomUUID() },
    });
    const thread = isRecord(receipt) ? receipt.thread : null;
    if (!isRecord(thread) || !UUID.test(String(thread.thread_id ?? '')) ||
        thread.status !== 'open' || !validTime(thread.created_at)) {
      return { status: 'error', message: UNCERTAIN };
    }
    const id = String(thread.thread_id);
    const list: unknown = await api('/api/v1/support/threads');
    const rows = isRecord(list) ? list.threads : null;
    if (!Array.isArray(rows) || !rows.some((row: unknown) =>
      isRecord(row) && row.thread_id === id && row.subject === subject)) {
      return { status: 'error', message: UNCERTAIN };
    }
    const transcript: unknown = await api(`/api/v1/support/threads/${encodeURIComponent(id)}/messages`);
    const messages = isRecord(transcript) ? transcript.messages : null;
    if (!Array.isArray(messages) || !messages.some((message: unknown) => verifiedMessage(message, body))) {
      return { status: 'error', message: UNCERTAIN };
    }
    revalidatePath('/support');
    return { status: 'ok', message: '문의가 저장된 것을 확인했어요.', threadId: id };
  } catch {
    return { status: 'error', message: UNCERTAIN };
  }
}

export async function replySupportThread(
  _previous: SupportActionState,
  formData: FormData,
): Promise<SupportActionState> {
  const threadId = text(formData.get('threadId'));
  const body = text(formData.get('body'));
  if (!UUID.test(threadId) || !body || body.length > 2000) {
    return { status: 'error', message: '문의와 답장 내용을 확인해 주세요(2000자 이내).' };
  }

  try {
    const receipt: unknown = await api(`/api/v1/support/threads/${encodeURIComponent(threadId)}/messages`, {
      method: 'POST', csrfToken: await csrf(), body: { body, idempotencyKey: randomUUID() },
    });
    const message = isRecord(receipt) ? receipt.message : null;
    if (!verifiedMessage(message, body)) return { status: 'error', message: UNCERTAIN };
    const transcript: unknown = await api(`/api/v1/support/threads/${encodeURIComponent(threadId)}/messages`);
    const messages = isRecord(transcript) ? transcript.messages : null;
    if (!Array.isArray(messages) || !messages.some((row: unknown) =>
      verifiedMessage(row, body) && row.message_id === message.message_id)) {
      return { status: 'error', message: UNCERTAIN };
    }
    revalidatePath('/support');
    return { status: 'ok', message: '답장이 저장된 것을 확인했어요.' };
  } catch {
    return { status: 'error', message: UNCERTAIN };
  }
}
