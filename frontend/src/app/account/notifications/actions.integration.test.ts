import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mutate, revalidatePath } = vi.hoisted(() => ({
  mutate: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock('@/lib/mutate', () => ({ mutate }));
vi.mock('next/cache', () => ({ revalidatePath }));
vi.mock('next/navigation', () => ({
  redirect: (url: string): never => { throw new Error(`REDIRECT:${url}`); },
}));

import { saveGoalNotifications } from './actions';

function submission(value: string): FormData {
  const data = new FormData();
  data.set('notificationsEnabled', value);
  return data;
}

describe('notification preferences server action ↔ engagement API contract', () => {
  beforeEach(() => { mutate.mockReset(); revalidatePath.mockReset(); });

  it.each([
    ['true', true, 'on'],
    ['false', false, 'off'],
  ])('accepts persisted %s and redirects to an independently read-verified view', async (form, saved, query) => {
    mutate.mockResolvedValue({ notifications_enabled: saved });
    await expect(saveGoalNotifications(submission(form))).rejects.toThrow(`REDIRECT:/account/notifications?requested=${query}`);
    expect(mutate).toHaveBeenCalledWith('/api/v1/engagement/preferences', {
      method: 'PUT', body: { notificationsEnabled: saved },
    });
    expect(revalidatePath).toHaveBeenCalledWith('/account/notifications');
    expect(revalidatePath).toHaveBeenCalledWith('/quests');
  });

  it.each([
    [{ notifications_enabled: false }],
    [{ notifications_enabled: 'true' }],
    [{}],
    [null],
  ])('fails closed when the write receipt is missing, malformed or disagrees', async (receipt) => {
    mutate.mockResolvedValue(receipt);
    await expect(saveGoalNotifications(submission('true'))).rejects.toThrow('REDIRECT:/account/notifications?error=save');
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it('does not confirm success on a rejected API request', async () => {
    mutate.mockRejectedValue(new Error('503'));
    await expect(saveGoalNotifications(submission('true'))).rejects.toThrow('REDIRECT:/account/notifications?error=save');
  });

  it('rejects unrecognized submitted values before any mutation', async () => {
    await expect(saveGoalNotifications(submission('maybe'))).rejects.toThrow('REDIRECT:/account/notifications?error=invalid');
    expect(mutate).not.toHaveBeenCalled();
  });
});
