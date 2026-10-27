'use server';

import { revalidatePath } from 'next/cache';
import { api } from '@/lib/api';

async function csrf() {
  const session = await api<{ csrfToken: string }>('/api/v1/auth/session');
  return session.csrfToken;
}
function required(form: FormData, name: string): string {
  const value = form.get(name);
  if (typeof value !== 'string' || !value) throw new Error(`Missing ${name}`);
  return value;
}

export async function createVerifiedHelpDraft(form: FormData): Promise<void> {
  if (process.env.VERIFIED_HELP_CENTER_V1 !== 'true') throw new Error('Help center is unavailable');
  await api('/api/v1/admin/help/articles', {
    method: 'POST', csrfToken: await csrf(),
    body: {
      idempotencyKey: required(form,'idempotencyKey'), locale: required(form,'locale'),
      slug: required(form,'slug'), category: required(form,'category'),
      title: required(form,'title'), summary: required(form,'summary'),
      body: required(form,'body'), sourceUrl: required(form,'sourceUrl'),
      sourceSha256: required(form,'sourceSha256'), reviewedUntil: required(form,'reviewedUntil'),
    },
  });
  revalidatePath('/admin/help');
}

async function changePublication(form: FormData, action: 'publish'|'retract') {
  if (process.env.VERIFIED_HELP_CENTER_V1 !== 'true') throw new Error('Help center is unavailable');
  const id = required(form,'articleId');
  if (!/^[0-9a-f-]{36}$/i.test(id)) throw new Error('Invalid article identifier');
  const expectedVersion = required(form,'expectedVersion');
  if (!/^[1-9][0-9]{0,18}$/.test(expectedVersion)) throw new Error('Invalid article version');
  await api(`/api/v1/admin/help/articles/${encodeURIComponent(id)}/${action}`, {
    method: 'POST', csrfToken: await csrf(),
    body: { idempotencyKey: required(form,'idempotencyKey'), expectedVersion },
  });
  revalidatePath('/admin/help');
  revalidatePath('/help');
}
export async function publishVerifiedHelp(form: FormData) { await changePublication(form,'publish'); }
export async function retractVerifiedHelp(form: FormData) { await changePublication(form,'retract'); }
