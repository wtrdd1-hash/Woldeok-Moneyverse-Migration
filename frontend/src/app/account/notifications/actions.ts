'use server';

import { randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { mutate } from '@/lib/mutate';
import { api } from '@/lib/api';

function hasPreference(value: unknown, expected: boolean): boolean {
  return typeof value === 'object' && value !== null &&
    'notifications_enabled' in value && value.notifications_enabled === expected;
}

export async function saveGoalNotifications(formData: FormData): Promise<void> {
  const value = String(formData.get('notificationsEnabled') ?? '');
  if (value !== 'true' && value !== 'false') redirect('/account/notifications?error=invalid');
  const nonce = randomBytes(16).toString('hex');
  try {
    const requested = value === 'true';
    const receipt = await mutate<unknown>('/api/v1/engagement/preferences', {
      method: 'PUT', body: { notificationsEnabled: requested },
    });
    if (!hasPreference(receipt, requested)) throw new Error('preference mutation receipt is unverified');
    // A successful HTTP response alone does not prove the owner's persisted state.
    const readback = await api<unknown>('/api/v1/engagement');
    if (!hasPreference(readback, requested)) throw new Error('preference readback is unverified');
    // Only the server issues this short-lived confirmation after both checks pass.
    (await cookies()).set('mv-notification-save-proof', `${nonce}:${requested ? '1' : '0'}`, {
      httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production',
      path: '/account/notifications', maxAge: 60,
    });
  } catch {
    redirect('/account/notifications?error=save');
  }
  revalidatePath('/account/notifications');
  revalidatePath('/quests');
  redirect(`/account/notifications?saved=${nonce}`);
}
