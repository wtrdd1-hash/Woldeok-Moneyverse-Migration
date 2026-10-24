import { beforeEach, describe, expect, it, vi } from 'vitest';
import { IDLE } from '@/lib/action-state';
import { saveWorkFavoriteAction } from './work-favorite-actions';

const mutate = vi.hoisted(() => vi.fn());
const revalidatePath = vi.hoisted(() => vi.fn());
vi.mock('@/lib/mutate', () => ({ mutate, failure: () => ({ status: 'error', message: 'failed' }) }));
vi.mock('next/cache', () => ({ revalidatePath }));

const TASK = '00000000-0000-4000-8000-000000000002';
function form(taskId: string, saved: string): FormData {
  const data = new FormData();
  data.set('taskId', taskId);
  data.set('saved', saved);
  return data;
}

beforeEach(() => { vi.resetAllMocks(); });

describe('work favorite server action', () => {
  it('rejects malformed task or saved state before making an API call', async () => {
    expect((await saveWorkFavoriteAction(IDLE, form('not-uuid', 'true'))).status).toBe('error');
    expect((await saveWorkFavoriteAction(IDLE, form(TASK, 'toggle'))).status).toBe('error');
    expect(mutate).not.toHaveBeenCalled();
  });
  it('requires authoritative readback before announcing success', async () => {
    mutate.mockResolvedValue({ saved: false, replayed: false });
    expect((await saveWorkFavoriteAction(IDLE, form(TASK, 'true'))).status).toBe('error');
    expect(revalidatePath).not.toHaveBeenCalled();
  });
  it('sends an explicit save and revalidates the task board only on confirmed success', async () => {
    mutate.mockResolvedValue({ saved: true, replayed: false });
    expect((await saveWorkFavoriteAction(IDLE, form(TASK, 'true'))).status).toBe('ok');
    expect(mutate).toHaveBeenCalledWith(`/api/v1/work/favorites/${TASK}`, { body: { saved: true } });
    expect(revalidatePath).toHaveBeenCalledWith('/work');
  });
});
