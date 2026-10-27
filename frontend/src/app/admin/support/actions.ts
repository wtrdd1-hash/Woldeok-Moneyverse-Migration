'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { api } from '@/lib/api';

async function csrf(): Promise<string> {
  const session = await api<{ csrfToken: string }>('/api/v1/auth/session');
  if (!session || typeof session.csrfToken !== 'string' || !session.csrfToken.trim()) {
    throw new Error('Administrator session verification unavailable');
  }
  return session.csrfToken;
}

const t = (v: FormDataEntryValue | null) => typeof v === 'string' ? v.trim() : '';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const STATUSES = ['open', 'waiting_user', 'resolved'] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function assertReplyReceipt(response: unknown, body: string): void {
  const message = isRecord(response) ? response.message : null;
  if (!isRecord(message) || !UUID.test(String(message.message_id ?? '')) ||
      message.sender_kind !== 'admin' || message.body !== body ||
      typeof message.created_at !== 'string' || !Number.isFinite(Date.parse(message.created_at))) {
    throw new Error('Support reply was not confirmed by the server');
  }
}

function assertStatusReceipt(response: unknown, status: string): void {
  if (!isRecord(response) || response.status !== status) {
    throw new Error('Support status change was not confirmed by the server');
  }
}

export async function adminSupportReply(formData: FormData): Promise<void> {
  const id = t(formData.get('threadId'));
  const body = t(formData.get('body'));
  if (!UUID.test(id) || !body || body.length > 2000) throw new Error('Invalid support reply request');
  const receipt: unknown = await api(`/api/v1/admin/support/threads/${encodeURIComponent(id)}/messages`, {
    method: 'POST',
    csrfToken: await csrf(),
    body: { body, idempotencyKey: randomUUID() },
  });
  assertReplyReceipt(receipt, body);
  revalidatePath('/admin/support');
}

export async function adminSupportStatus(formData: FormData): Promise<void> {
  const id = t(formData.get('threadId'));
  const status = t(formData.get('status'));
  if (!UUID.test(id) || !STATUSES.includes(status as (typeof STATUSES)[number])) {
    throw new Error('Invalid support status request');
  }
  const receipt: unknown = await api(`/api/v1/admin/support/threads/${encodeURIComponent(id)}/status`, {
    method: 'PUT',
    csrfToken: await csrf(),
    body: { status },
  });
  assertStatusReceipt(receipt, status);
  revalidatePath('/admin/support');
}
