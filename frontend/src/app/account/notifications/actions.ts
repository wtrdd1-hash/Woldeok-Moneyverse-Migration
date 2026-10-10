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


/**
 * Mark one notification or the entire inbox as read.
 * The server-only mutate helper fetches and spends a fresh CSRF token.
 * The UI may only change its read state after an authoritative acknowledgment.
 */
export async function markAccountNotificationRead(notificationId: string | null): Promise<{ ok: boolean }> {
  if (notificationId !== null && !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(notificationId)) {
    return { ok: false };
  }
  try {
    if (notificationId === null) {
      const updated = await mutate<number>('/api/v1/notifications/read-all');
      return { ok: Number.isSafeInteger(updated) && updated >= 0 };
    }
    const updated = await mutate<boolean>(`/api/v1/notifications/${encodeURIComponent(notificationId)}/read`);
    return { ok: updated === true };
  } catch {
    return { ok: false };
  }
}
