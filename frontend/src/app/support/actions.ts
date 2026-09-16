'use server';

import { randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { api } from '@/lib/api';

async function csrf(): Promise<string> {
  return (await api<{ csrfToken: string }>('/api/v1/auth/session')).csrfToken;
}
function text(value: FormDataEntryValue | null): string { return String(value ?? '').trim(); }

export async function createSupportThread(formData: FormData): Promise<void> {
  const subject = text(formData.get('subject')).slice(0, 120);
  const body = text(formData.get('body')).slice(0, 2000);
  if (!subject || !body) return;
  await api('/api/v1/support/threads', {
    method: 'POST', csrfToken: await csrf(),
    body: { subject, body, idempotencyKey: randomUUID() },
  });
  revalidatePath('/support');
}

export async function replySupportThread(formData: FormData): Promise<void> {
  const threadId = text(formData.get('threadId'));
  const body = text(formData.get('body')).slice(0, 2000);
  if (!threadId || !body) return;
  await api(`/api/v1/support/threads/${encodeURIComponent(threadId)}/messages`, {
    method: 'POST', csrfToken: await csrf(), body: { body, idempotencyKey: randomUUID() },
  });
  revalidatePath('/support');
}
