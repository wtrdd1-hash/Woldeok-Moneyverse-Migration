// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  api: vi.fn(),
  apiBytes: vi.fn(),
  mutate: vi.fn(),
  failure: vi.fn(() => ({ status: 'error', message: 'Submission failed' })),
  revalidatePath: vi.fn(),
}));
vi.mock('@/lib/api', () => ({ api: mocks.api, apiBytes: mocks.apiBytes }));
vi.mock('@/lib/mutate', () => ({ mutate: mocks.mutate, failure: mocks.failure }));
vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }));

import { submitPhoto } from './actions';

const photoId = '123e4567-e89b-42d3-a456-426614174001';
const storageKey = '123e4567-e89b-42d3-a456-426614174000.png';
const receipt = { photo_id: photoId, submitted_at: '2026-10-26T04:00:00.000Z', replayed: false };
function form(): FormData {
  const data = new FormData();
  data.set('photo', new File(['image'], 'picture.png', { type: 'image/png' }));
  data.set('altText', 'A verified community photo');
  return data;
}

describe('member photo submission server receipt', () => {
  beforeEach(() => {
    Object.defineProperty(File.prototype, 'arrayBuffer', { configurable: true, value: async () => new ArrayBuffer(5) });
    vi.resetAllMocks();
    mocks.api.mockResolvedValue({ csrfToken: 'csrf' });
    mocks.apiBytes.mockResolvedValue({ storageKey });
    mocks.mutate.mockResolvedValue(receipt);
    mocks.failure.mockReturnValue({ status: 'error', message: 'Submission failed' });
  });

  it('acknowledges only a verified persisted photo and revalidates the private list', async () => {
    const result = await submitPhoto({ status: 'idle' }, form());
    expect(result.status).toBe('ok');
    expect(mocks.mutate).toHaveBeenCalledWith('/api/v1/photos', expect.objectContaining({
      body: expect.objectContaining({ storageKey, altText: 'A verified community photo', idempotencyKey: expect.any(String) }),
    }));
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/gallery/submit');
  });

  it('uses the server replay receipt rather than reporting a new submission', async () => {
    mocks.mutate.mockResolvedValue({ ...receipt, replayed: true });
    expect((await submitPhoto({ status: 'idle' }, form())).message).toContain('이미 보낸');
  });

  it.each([
    { photo_id: undefined, submitted_at: receipt.submitted_at, replayed: false },
    { ...receipt, photo_id: 'not-a-uuid' },
    { ...receipt, replayed: 'false' },
    { ...receipt, submitted_at: 'not-a-timestamp' },
    {},
    null,
  ])('does not claim success when the persisted receipt is invalid: %j', async (badReceipt) => {
    mocks.mutate.mockResolvedValue(badReceipt);
    const result = await submitPhoto({ status: 'idle' }, form());
    expect(result.status).toBe('error');
    expect(result.message).toContain('내가 보낸 사진');
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it('refuses a malformed upload key before submitting a draft', async () => {
    mocks.apiBytes.mockResolvedValue({ storageKey: '../private.png' });
    const result = await submitPhoto({ status: 'idle' }, form());
    expect(result.status).toBe('error');
    expect(mocks.mutate).not.toHaveBeenCalled();
  });

  it('does not upload when a photo is missing', async () => {
    const result = await submitPhoto({ status: 'idle' }, new FormData());
    expect(result.status).toBe('error');
    expect(mocks.apiBytes).not.toHaveBeenCalled();
  });

  it('reports API errors without a fabricated success receipt', async () => {
    mocks.mutate.mockRejectedValue(new Error('unavailable'));
    const result = await submitPhoto({ status: 'idle' }, form());
    expect(result.status).toBe('error');
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });
});
