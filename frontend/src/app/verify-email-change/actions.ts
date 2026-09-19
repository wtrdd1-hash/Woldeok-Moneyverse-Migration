'use server';
import { redirect } from 'next/navigation';
import { api } from '@/lib/api';

export async function completeLoginEmailChange(formData: FormData): Promise<void> {
  const token = String(formData.get('token') ?? '').trim();
  if (token.length < 32 || token.length > 512) redirect('/verify-email-change?status=invalid');
  try {
    await api<{ outcome: 'email-changed'; sessionsRevoked: true }>('/api/v1/auth/local/email-change/complete', { method: 'POST', body: { token } });
  } catch {
    redirect('/verify-email-change?status=failed');
  }
  redirect('/login?email_changed=1');
}
