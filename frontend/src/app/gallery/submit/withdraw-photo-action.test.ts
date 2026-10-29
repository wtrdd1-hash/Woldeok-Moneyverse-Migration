import { beforeEach, describe, expect, it, vi } from 'vitest';

const mutateMock = vi.hoisted(() => vi.fn());
const apiMock = vi.hoisted(() => vi.fn());
const revalidateMock = vi.hoisted(() => vi.fn());
vi.mock('@/lib/mutate', () => ({
  mutate: mutateMock,
  failure: (_error: unknown, fallback: string) => ({ status: 'error', message: fallback }),
}));
vi.mock('next/cache', () => ({ revalidatePath: revalidateMock }));
vi.mock('@/lib/api', () => ({ api: apiMock, apiBytes: vi.fn() }));
import { withdrawPendingPhoto } from './actions';

const photo = 'd787fdf4-7612-4ec2-b2f0-770d975c3b27';
const other = 'c787fdf4-7612-4ec2-b2f0-770d975c3b27';
const key = 'e724f718-2aa2-4a3d-9b1a-15db04e86eb1';
const form = (id = photo, requestKey = key) => {
  const data = new FormData();
  data.set('photoId', id);
  data.set('idempotencyKey', requestKey);
  return data;
};
const ownerList = (rows: unknown[]) => ({ submissions: rows });
const draft = { photo_id: photo, published: false };
const receipt = { photo_id: photo, withdrawn_at: '2026-10-29T09:00:00.000Z', replayed: false };

function setupReadbacks(after: unknown = ownerList([])) {
  apiMock.mockResolvedValueOnce(ownerList([draft])).mockResolvedValueOnce(after);
}

describe('pending photo withdrawal server action', () => {
  beforeEach(() => {
    mutateMock.mockReset(); apiMock.mockReset(); revalidateMock.mockReset();
  });
  it('rejects malformed IDs without a network mutation', async () => {
    expect((await withdrawPendingPhoto({ status: 'idle' }, form('bad'))).status).toBe('error');
    expect(mutateMock).not.toHaveBeenCalled();
  });
  it('requires the owner draft to be visible before attempting withdrawal', async () => {
    apiMock.mockResolvedValueOnce(ownerList([{ photo_id: photo, published: true }]));
    expect((await withdrawPendingPhoto({ status: 'idle' }, form())).status).toBe('error');
    expect(mutateMock).not.toHaveBeenCalled();
  });
  it('rejects a truncated or malformed owner inventory before mutation', async () => {
    apiMock.mockResolvedValueOnce({ submissions: null });
    expect((await withdrawPendingPhoto({ status: 'idle' }, form())).status).toBe('error');
    expect(mutateMock).not.toHaveBeenCalled();
  });
  it('verifies the exact withdrawal receipt and persisted absence before success', async () => {
    setupReadbacks(); mutateMock.mockResolvedValue(receipt);
    const result = await withdrawPendingPhoto({ status: 'idle' }, form());
    expect(result.status).toBe('ok');
    expect(mutateMock).toHaveBeenCalledWith('/api/v1/photos/withdraw', {
      body: { photoId: photo, idempotencyKey: key },
    });
    expect(apiMock).toHaveBeenNthCalledWith(1, '/api/v1/photos/mine');
    expect(apiMock).toHaveBeenNthCalledWith(2, '/api/v1/photos/mine');
    expect(revalidateMock).toHaveBeenCalledWith('/gallery/submit');
  });
  it('accepts a verified idempotent replay only after owner readback', async () => {
    setupReadbacks(); mutateMock.mockResolvedValue({ ...receipt, replayed: true });
    expect((await withdrawPendingPhoto({ status: 'idle' }, form())).message).toContain('이미 철회');
  });
  it.each([
    ['empty 2xx receipt', {}],
    ['wrong photo receipt', { ...receipt, photo_id: other }],
    ['missing withdrawal time', { photo_id: photo, replayed: false }],
    ['invalid withdrawal time', { ...receipt, withdrawn_at: 'not-a-date' }],
    ['missing replay flag', { photo_id: photo, withdrawn_at: receipt.withdrawn_at }],
    ['string replay flag', { ...receipt, replayed: 'false' }],
  ])('refuses success for %s', async (_name, result) => {
    setupReadbacks(); mutateMock.mockResolvedValue(result);
    expect((await withdrawPendingPhoto({ status: 'idle' }, form())).status).toBe('error');
    expect(revalidateMock).not.toHaveBeenCalled();
  });
  it('refuses success if the owner list still contains the photo', async () => {
    setupReadbacks(ownerList([draft])); mutateMock.mockResolvedValue(receipt);
    expect((await withdrawPendingPhoto({ status: 'idle' }, form())).status).toBe('error');
    expect(revalidateMock).not.toHaveBeenCalled();
  });
  it('refuses success when post-withdrawal owner readback is unavailable', async () => {
    setupReadbacks({ submissions: null }); mutateMock.mockResolvedValue(receipt);
    expect((await withdrawPendingPhoto({ status: 'idle' }, form())).status).toBe('error');
    expect(revalidateMock).not.toHaveBeenCalled();
  });
  it('never suggests a blind retry after an ambiguous mutation', async () => {
    apiMock.mockResolvedValueOnce(ownerList([draft]));
    mutateMock.mockRejectedValue(new Error('timeout after commit'));
    const result = await withdrawPendingPhoto({ status: 'idle' }, form());
    expect(result.status).toBe('error');
    expect(result.message).toContain('확인');
    expect(revalidateMock).not.toHaveBeenCalled();
  });
});
