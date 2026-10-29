'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { api } from '@/lib/api';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const STATUS = new Set(['open', 'waiting_user', 'resolved']);
const t = (v: FormDataEntryValue | null) => (typeof v === 'string' ? v.trim() : '');

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isVerifiedReply(value: unknown, body: string): value is Record<string, unknown> & {
  message_id: string;
  sender_kind: 'admin';
  body: string;
  created_at: string;
} {
  return (
    isRecord(value) &&
    typeof value.message_id === 'string' && UUID.test(value.message_id) &&
    value.sender_kind === 'admin' &&
    value.body === body &&
    typeof value.created_at === 'string' &&
    Number.isFinite(Date.parse(value.created_at))
  );
}

async function csrf(): Promise<string> {
  const session = await api<unknown>('/api/v1/auth/session');
  if (!isRecord(session) || typeof session.csrfToken !== 'string' || !session.csrfToken) {
    throw new Error('Support session verification failed');
  }
  return session.csrfToken;
}

export async function adminSupportReply(formData: FormData): Promise<void> {
  const id = t(formData.get('threadId'));
  const body = t(formData.get('body'));
  const suppliedKey = t(formData.get('idempotencyKey'));
  if (!UUID.test(id) || !body || body.length > 2000 ||
      (suppliedKey && !UUID.test(suppliedKey))) {
    throw new Error('Invalid support reply request');
  }

  const path = `/api/v1/admin/support/threads/${encodeURIComponent(id)}/messages`;
  const result = await api<unknown>(path, {
    method: 'POST',
    csrfToken: await csrf(),
    body: { body, idempotencyKey: suppliedKey || randomUUID() },
  });
  const receipt = isRecord(result) ? result.message : null;
  if (!isVerifiedReply(receipt, body)) {
    throw new Error('Support reply receipt was not verified');
  }

  // The DB function returns the inserted (or idempotently replayed) row. Its
  // message-history reader exposes the oldest 500, so a readback would reject
  // successful replies on long-running threads. The validated DB receipt is authoritative.

  revalidatePath('/admin/support');
}

export async function adminSupportStatus(formData: FormData): Promise<void> {
  const id = t(formData.get('threadId'));
  const status = t(formData.get('status'));
  if (!UUID.test(id) || !STATUS.has(status)) {
    throw new Error('Invalid support status request');
  }

  const result = await api<unknown>(`/api/v1/admin/support/threads/${encodeURIComponent(id)}/status`, {
    method: 'PUT',
    csrfToken: await csrf(),
    body: { status },
  });
  if (!isRecord(result) || result.status !== status) {
    throw new Error('Support status receipt was not verified');
  }

  // NestJS returns this receipt only after the privileged SQL function reports
  // a successful UPDATE. The inbox is capped at 100 and sorted by status; a
  // separate list read cannot reliably find a newly resolved thread.

  revalidatePath('/admin/support');
}
