'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { mutate } from '@/lib/mutate';
import { verifiedNotificationPreference } from './notification-preference';

export async function saveGoalNotifications(formData: FormData): Promise<void> {
  const value = formData.get('notificationsEnabled');
  if (value !== 'true' && value !== 'false') redirect('/account/notifications?error=invalid');
  const requested = value === 'true';
  try {
    // The backend returns the value persisted by PostgreSQL, not an echo of
    // the form. A 2xx with a missing/mismatched receipt is not a success.
    const receipt = await mutate<unknown>('/api/v1/engagement/preferences', {
      method: 'PUT', body: { notificationsEnabled: requested },
    });
    if (verifiedNotificationPreference(receipt) !== requested) {
      throw new Error('engagement preference write receipt mismatch');
    }
  } catch {
    redirect('/account/notifications?error=save');
  }
  revalidatePath('/account/notifications');
  revalidatePath('/quests');
  // The next page independently reads the server state. This query is a
  // requested value, never a success receipt.
  redirect(`/account/notifications?requested=${requested ? 'on' : 'off'}`);
}
