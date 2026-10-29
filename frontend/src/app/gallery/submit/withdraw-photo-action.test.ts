import { beforeEach, describe, expect, it, vi } from 'vitest';

const mutateMock = vi.hoisted(() => vi.fn());
const revalidateMock = vi.hoisted(() => vi.fn());
vi.mock('@/lib/mutate', () => ({
  mutate: mutateMock,
  failure: (_error: unknown, fallback: string) => ({ status: 'error', message: fallback }),
}));
vi.mock('next/cache', () => ({ revalidatePath: revalidateMock }));
vi.mock('@/lib/api', () => ({ api: vi.fn(), apiBytes: vi.fn() }));
import { withdrawPendingPhoto } from './actions';

const photo = 'd787fdf4-7612-4ec2-b2f0-770d975c3b27';
const key = 'e724f718-2aa2-4a3d-9b1a-15db04e86eb1';
const form = (id = photo, requestKey = key) => {
  const data = new FormData();
  data.set('photoId', id);
  data.set('idempotencyKey', requestKey);
  return data;
};

describe('pending photo withdrawal server action', () => {
  beforeEach(() => { mutateMock.mockReset(); revalidateMock.mockReset(); });
  it('rejects malformed IDs without a network mutation', async () => {
    expect((await withdrawPendingPhoto({ status: 'idle' }, form('bad'))).status).toBe('error');
    expect(mutateMock).not.toHaveBeenCalled();
  });
  it('uses the supplied stable request key, then refreshes the owner view', async () => {
    mutateMock.mockResolvedValue({ replayed: false });
    const result = await withdrawPendingPhoto({ status: 'idle' }, form());
    expect(result.status).toBe('ok');
    expect(mutateMock).toHaveBeenCalledWith('/api/v1/photos/withdraw', {
      body: { photoId: photo, idempotencyKey: key },
    });
    expect(revalidateMock).toHaveBeenCalledWith('/gallery/submit');
  });
  it('reports a retry as already withdrawn', async () => {
    mutateMock.mockResolvedValue({ replayed: true });
    expect((await withdrawPendingPhoto({ status: 'idle' }, form())).message).toContain('이미 철회');
  });
});
