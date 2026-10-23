'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { api } from '@/lib/api';

// PostgreSQL's support receipts deduplicate by this key; do not generate a
// fresh key inside an action when the browser retries the same submission.
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function csrf(): Promise<string> {
  return (await api<{ csrfToken: string }>('/api/v1/auth/session')).csrfToken;
}

function text(value: FormDataEntryValue | null): string {
  return typeof value === 'string' ? value.trim() : '';
}

function requiredKey(formData: FormData): string {
  const key = text(formData.get('idempotencyKey'));
  if (!UUID_V4.test(key)) throw new Error('Invalid support submission');
  return key;
}

export async function createSupportThread(formData: FormData): Promise<void> {
  const idempotencyKey = requiredKey(formData);
  const subject = text(formData.get('subject')).slice(0, 120);
  const body = text(formData.get('body')).slice(0, 2000);
  if (!subject || !body) throw new Error('Invalid support submission');

  const { thread } = await api<{ thread: { thread_id: string } }>('/api/v1/support/threads', {
    method: 'POST',
    csrfToken: await csrf(),
    body: { subject, body, idempotencyKey },
  });
  if (!thread || !UUID_V4.test(thread.thread_id)) throw new Error('Invalid support receipt');

  revalidatePath('/support');
  redirect(`/support?thread=${thread.thread_id}`);
}

export async function replySupportThread(formData: FormData): Promise<void> {
  const idempotencyKey = requiredKey(formData);
  const threadId = text(formData.get('threadId'));
  const body = text(formData.get('body')).slice(0, 2000);
  if (!UUID_V4.test(threadId) || !body) throw new Error('Invalid support submission');

  await api(`/api/v1/support/threads/${threadId}/messages`, {
    method: 'POST',
    csrfToken: await csrf(),
    body: { body, idempotencyKey },
  });
  revalidatePath('/support');
  redirect(`/support?thread=${threadId}`);
}
