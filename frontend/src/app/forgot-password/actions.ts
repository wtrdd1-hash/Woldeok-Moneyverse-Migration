'use server';
import { redirect } from 'next/navigation';
import { api } from '@/lib/api';

export async function requestPasswordReset(formData: FormData): Promise<never> {
  const email = String(formData.get('email') ?? '').trim();
  if (!email) redirect('/forgot-password?error=fields');
  try {
    await api('/api/v1/auth/local/password-reset/request', { method: 'POST', body: { email } });
  } catch {
    // The recovery surface is deliberately enumeration-resistant.
  }
  redirect('/forgot-password?sent=1');
}
