import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ mutate: vi.fn(), read: vi.fn(), revalidate: vi.fn() }));
vi.mock('@/lib/mutate', () => ({ mutate: mocks.mutate }));
vi.mock('@/lib/api', () => ({ api: mocks.read }));
vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidate }));
vi.mock('next/navigation', () => ({ redirect: (url: string) => { throw new Error(`REDIRECT:${url}`); } }));

import { saveGoalNotifications } from './actions';

function preference(value: string): FormData {
  const form = new FormData();
  form.set('notificationsEnabled', value);
  return form;
}

beforeEach(() => { vi.clearAllMocks(); });

describe('member notification preference persistence', () => {
  it('announces saved only after matching PUT receipt and fresh owner dashboard', async () => {
    mocks.mutate.mockResolvedValue({ notifications_enabled: false });
    mocks.read.mockResolvedValue({ notifications_enabled: false });
    await expect(saveGoalNotifications(preference('false'))).rejects.toThrow('REDIRECT:/account/notifications?saved=1');
    expect(mocks.read).toHaveBeenCalledWith('/api/v1/engagement');
    expect(mocks.revalidate).toHaveBeenCalledWith('/quests');
  });

  it.each([null, {}, { notifications_enabled: true }, { notifications_enabled: 'false' }])(
    'rejects missing, contradictory or non-boolean PUT receipts: %s', async (receipt) => {
      mocks.mutate.mockResolvedValue(receipt);
      await expect(saveGoalNotifications(preference('false'))).rejects.toThrow('REDIRECT:/account/notifications?error=save');
      expect(mocks.read).not.toHaveBeenCalled();
      expect(mocks.revalidate).not.toHaveBeenCalled();
    },
  );

  it.each([null, {}, { notifications_enabled: true }, { notifications_enabled: 'false' }])(
    'rejects stale or malformed dashboard readback: %s', async (readback) => {
      mocks.mutate.mockResolvedValue({ notifications_enabled: false });
      mocks.read.mockResolvedValue(readback);
      await expect(saveGoalNotifications(preference('false'))).rejects.toThrow('REDIRECT:/account/notifications?error=save');
      expect(mocks.revalidate).not.toHaveBeenCalled();
    },
  );

  it('rejects invalid submitted values without mutating', async () => {
    await expect(saveGoalNotifications(preference('yes'))).rejects.toThrow('REDIRECT:/account/notifications?error=invalid');
    expect(mocks.mutate).not.toHaveBeenCalled();
  });
});
