'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { mutate } from '@/lib/mutate';

export async function saveGoalNotifications(formData: FormData): Promise<void> {
  const value = String(formData.get('notificationsEnabled') ?? '');
  if (value !== 'true' && value !== 'false') redirect('/account/notifications?error=invalid');
  try {
    await mutate<{ notifications_enabled: boolean }>('/api/v1/engagement/preferences', {
      method: 'PUT', body: { notificationsEnabled: value === 'true' },
    });
  } catch {
    redirect('/account/notifications?error=save');
  }
  revalidatePath('/account/notifications');
  revalidatePath('/quests');
  redirect('/account/notifications?saved=1');
}
