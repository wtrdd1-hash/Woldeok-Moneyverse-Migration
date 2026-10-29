import { beforeEach, describe, expect, it, vi } from 'vitest';
import { actionChatReport } from './actions';
import { mutate } from '@/lib/mutate';
import { revalidatePath } from 'next/cache';

vi.mock('@/lib/mutate', () => ({ mutate: vi.fn(), failure: vi.fn() }));
vi.mock('@/lib/api', () => ({ apiOrNull: vi.fn() }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

function form(action = 'ACTIONED_BLOCKED'): FormData {
  const data = new FormData();
  data.set('reportId', 'report-1');
  data.set('action', action);
  data.set('note', 'evidence reviewed');
  return data;
}

const receipt = {
  success: true, reportId: 'report-1', newStatus: 'ACTIONED_BLOCKED',
  effect: 'report_status_only', enforcementApplied: false, notificationSent: false,
};

describe('server action requires exact moderation status-only receipt', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('never reports success for a contradictory or incomplete backend response', async () => {
    for (const response of [{ success: true }, { ...receipt, enforcementApplied: true }, { ...receipt, reportId: 'another' }]) {
      vi.mocked(mutate).mockResolvedValueOnce(response);
      const result = await actionChatReport({ status: 'idle' }, form());
      expect(result.status).toBe('error');
      expect(revalidatePath).not.toHaveBeenCalled();
    }
  });

  it('acknowledges a verified persisted decision without claiming account enforcement', async () => {
    vi.mocked(mutate).mockResolvedValueOnce(receipt);
    const result = await actionChatReport({ status: 'idle' }, form());
    expect(result.status).toBe('ok');
    expect(result.message).toContain('계정 차단이나 경고 알림은 실행되지 않았습니다');
    expect(revalidatePath).toHaveBeenCalledWith('/admin/safety');
  });
});
