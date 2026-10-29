'use server';
import { redirect } from 'next/navigation';
import { api } from '@/lib/api';
import { isEmailChangeReceipt } from './email-change-receipt';

export async function completeLoginEmailChange(formData: FormData): Promise<void> {
  const token = String(formData.get('token') ?? '').trim();
  if (token.length < 32 || token.length > 512) redirect('/verify-email-change?status=invalid');
  let receipt: unknown;
  try {
    receipt = await api<unknown>('/api/v1/auth/local/email-change/complete', { method: 'POST', body: { token } });
  } catch {
    redirect('/verify-email-change?status=failed');
  }
  if (!isEmailChangeReceipt(receipt)) redirect('/verify-email-change?status=unverified');
  redirect('/login?email_changed=1');
}
