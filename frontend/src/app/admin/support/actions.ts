'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { api } from '@/lib/api';

async function csrf(): Promise<string> {
  const session = await api<{ csrfToken: string }>('/api/v1/auth/session');
  return session.csrfToken;
}

const t = (v: FormDataEntryValue | null) => String(v ?? '').trim();

export async function adminSupportReply(formData: FormData): Promise<void> {
  const id = t(formData.get('threadId'));
  const body = t(formData.get('body')).slice(0, 2000);
  if (!id || !body) return;
  await api(`/api/v1/admin/support/threads/${encodeURIComponent(id)}/messages`, {
    method: 'POST',
    csrfToken: await csrf(),
    body: { body, idempotencyKey: randomUUID() },
  });
  revalidatePath('/admin/support');
}

export async function adminSupportStatus(formData: FormData): Promise<void> {
  const id = t(formData.get('threadId'));
  const status = t(formData.get('status'));
  if (!id || !['open', 'waiting_user', 'resolved'].includes(status)) return;
  await api(`/api/v1/admin/support/threads/${encodeURIComponent(id)}/status`, {
    method: 'PUT',
    csrfToken: await csrf(),
    body: { status },
  });
  revalidatePath('/admin/support');
}
