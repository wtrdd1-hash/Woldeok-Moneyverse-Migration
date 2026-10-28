import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mutation, revalidate } = vi.hoisted(() => ({ mutation: vi.fn(), revalidate: vi.fn() }));
vi.mock('@/lib/mutate', () => ({ mutate: mutation, failure: () => ({ status: 'error', message: '요청 실패' }), idempotencyKey: () => '11111111-1111-4111-8111-111111111111' }));
vi.mock('@/lib/api', () => ({ api: vi.fn(), apiBytes: vi.fn() }));
vi.mock('next/cache', () => ({ revalidatePath: revalidate }));
import { deleteAnnouncementAction, rejectPhotoAction } from './actions';

const id = '11111111-1111-4111-8111-111111111111';
beforeEach(() => { mutation.mockReset(); revalidate.mockReset(); });

describe('admin content deletion receipts', () => {
  it('does not claim an announcement was deleted when PostgreSQL returns deleted:false', async () => {
    mutation.mockResolvedValue({ deleted: false });
    const result = await deleteAnnouncementAction(id);
    expect(result.status).toBe('error');
    expect(revalidate).not.toHaveBeenCalled();
  });
  it('does not accept missing or malformed announcement deletion receipts', async () => {
    for (const response of [undefined, {}, { deleted: 'true' }]) {
      mutation.mockResolvedValueOnce(response);
      expect((await deleteAnnouncementAction(id)).status).toBe('error');
    }
    expect(revalidate).not.toHaveBeenCalled();
  });
  it('accepts affirmative announcement deletion and refreshes relevant paths', async () => {
    mutation.mockResolvedValue({ deleted: true });
    const result = await deleteAnnouncementAction(id);
    expect(result.status).toBe('ok');
    expect(mutation).toHaveBeenCalledWith(`/api/v1/admin/announcements/${id}`, { method: 'DELETE' });
    expect(revalidate).toHaveBeenCalledWith('/admin/content');
  });
  it('does not claim photo deletion when the PostgreSQL target was absent', async () => {
    mutation.mockResolvedValue({ rejected: false, deleted: false });
    expect((await rejectPhotoAction(id)).status).toBe('error');
    expect(revalidate).not.toHaveBeenCalled();
  });
  it('rejects malformed photo deletion receipts and preserves moderation state', async () => {
    for (const response of [null, {}, { deleted: 'true' }, { rejected: true, deleted: true }]) {
      mutation.mockResolvedValueOnce(response);
      expect((await rejectPhotoAction(id)).status).toBe('error');
    }
    expect(revalidate).not.toHaveBeenCalled();
  });
  it('accepts affirmative photo deletion and refreshes the gallery', async () => {
    mutation.mockResolvedValue({ rejected: false, deleted: true });
    const result = await rejectPhotoAction(id);
    expect(result.status).toBe('ok');
    expect(mutation).toHaveBeenCalledWith(`/api/v1/admin/photos/${id}`, { method: 'DELETE' });
    expect(revalidate).toHaveBeenCalledWith('/gallery');
  });
});
