'use server';
import { redirect } from 'next/navigation';
import { ApiError, api } from '@/lib/api';
import { isPasswordResetReceipt } from './reset-receipt';
export async function completePasswordReset(formData: FormData): Promise<never> {
  const token = String(formData.get('token') ?? '');
  const password = String(formData.get('password') ?? '');
  const confirmPassword = String(formData.get('confirmPassword') ?? '');
  if (!token || !password || !confirmPassword) redirect(`/reset-password?error=fields&token=${encodeURIComponent(token)}`);
  if (password !== confirmPassword) redirect(`/reset-password?error=mismatch&token=${encodeURIComponent(token)}`);
  let receipt: unknown;
  try {
    receipt = await api<unknown>('/api/v1/auth/local/password-reset/complete', { method: 'POST', body: { token, password } });
  } catch (error) {
    const code = error instanceof ApiError && error.status === 403 ? 'policy' : 'invalid';
    redirect(`/reset-password?error=${code}&token=${encodeURIComponent(token)}`);
  }
  if (!isPasswordResetReceipt(receipt)) redirect(`/reset-password?error=unverified&token=${encodeURIComponent(token)}`);
  redirect('/login?password_reset=1');
}
