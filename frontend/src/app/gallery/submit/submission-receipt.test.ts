import { beforeEach, describe, expect, it, vi } from 'vitest';

const { read, upload, mutate, revalidate } = vi.hoisted(() => ({
  read: vi.fn(), upload: vi.fn(), mutate: vi.fn(), revalidate: vi.fn(),
}));
vi.mock('@/lib/api', () => ({ api: read, apiBytes: upload }));
vi.mock('@/lib/mutate', () => ({
  mutate,
  failure: (error: unknown, message: string) => ({ status: 'error', message: typeof error === 'object' && error !== null && 'status' in error ? '서비스가 일시적으로 불안정해요.' : message }),
}));
vi.mock('next/cache', () => ({ revalidatePath: revalidate }));

import { submitPhoto } from './actions';

const storageKey = 'dbf031ce-5aa4-4b91-bce8-bec1b2b4f023.png';
const timestamp = '2026-10-29T05:00:00.000Z';
const caption = 'My original gallery photo';

function form(): FormData {
  const data = new FormData();
  data.set('photo', new File([new Uint8Array([137, 80, 78, 71])], 'photo.png', { type: 'image/png' }));
  data.set('altText', caption);
  return data;
}

function key(): string {
  return mutate.mock.calls[0]?.[1]?.body?.idempotencyKey as string;
}

function validReceipt() {
  return { photo_id: key(), submitted_at: timestamp, replayed: false };
}

function validReadback() {
  return { submissions: [{
    photo_id: key(), image_url: `/media/${storageKey}`, alt_text: caption,
    published: false, submitted_at: timestamp, published_at: null,
  }] };
}

beforeEach(() => {
  vi.resetAllMocks();
  read.mockImplementation(async (path: string) => path === '/api/v1/photos/mine'
    ? validReadback() : { csrfToken: 'synthetic-csrf' });
  upload.mockResolvedValue({ storageKey });
  mutate.mockImplementation(async () => validReceipt());
});

describe('member gallery submission persistence receipts', () => {
  it('accepts only a matching backend receipt and owner readback', async () => {
    const result = await submitPhoto({ status: 'idle' }, form());
    expect(result.status).toBe('ok');
    expect(read).toHaveBeenCalledWith('/api/v1/photos/mine');
    expect(revalidate).toHaveBeenCalledWith('/gallery/submit');
  });

  it('does not claim acceptance when the 201 response is missing its receipt', async () => {
    mutate.mockResolvedValue(null);
    expect((await submitPhoto({ status: 'idle' }, form())).status).toBe('error');
    expect(revalidate).not.toHaveBeenCalled();
  });

  it('rejects a receipt for another photo ID', async () => {
    mutate.mockResolvedValue({ photo_id: '00000000-0000-4000-8000-000000000001', replayed: false, submitted_at: timestamp });
    expect((await submitPhoto({ status: 'idle' }, form())).status).toBe('error');
    expect(read).not.toHaveBeenCalledWith('/api/v1/photos/mine');
  });

  it('rejects an invalid replay flag and timestamp', async () => {
    mutate.mockImplementation(async () => ({ ...validReceipt(), replayed: 'false', submitted_at: 'not-a-date' }));
    expect((await submitPhoto({ status: 'idle' }, form())).status).toBe('error');
  });

  it('does not claim acceptance if the member readback is missing the photo', async () => {
    read.mockImplementation(async (path: string) => path === '/api/v1/photos/mine'
      ? { submissions: [] } : { csrfToken: 'synthetic-csrf' });
    expect((await submitPhoto({ status: 'idle' }, form())).status).toBe('error');
    expect(revalidate).not.toHaveBeenCalled();
  });

  it('rejects a readback with the wrong stored image path', async () => {
    read.mockImplementation(async (path: string) => path === '/api/v1/photos/mine'
      ? { submissions: [{ ...validReadback().submissions[0], image_url: '/media/another.png' }] }
      : { csrfToken: 'synthetic-csrf' });
    expect((await submitPhoto({ status: 'idle' }, form())).status).toBe('error');
  });

  it('rejects a readback with the wrong caption', async () => {
    read.mockImplementation(async (path: string) => path === '/api/v1/photos/mine'
      ? { submissions: [{ ...validReadback().submissions[0], alt_text: 'different' }] }
      : { csrfToken: 'synthetic-csrf' });
    expect((await submitPhoto({ status: 'idle' }, form())).status).toBe('error');
  });

  it('treats failed readback as unconfirmed and warns against blind retries', async () => {
    read.mockImplementation(async (path: string) => {
      if (path === '/api/v1/photos/mine') throw new Error('readback failed');
      return { csrfToken: 'synthetic-csrf' };
    });
    const result = await submitPhoto({ status: 'idle' }, form());
    expect(result.status).toBe('error');
    expect(result.message).toMatch(/다시|확인/);
    expect(revalidate).not.toHaveBeenCalled();
  });

  it('refuses an invalid upload storage key before attempting a database write', async () => {
    upload.mockResolvedValue({ storageKey: '../photo.png' });
    expect((await submitPhoto({ status: 'idle' }, form())).status).toBe('error');
    expect(mutate).not.toHaveBeenCalled();
  });

  it('preserves duplicate-safe recovery instructions if the POST may have committed before a 503', async () => {
    mutate.mockRejectedValue(Object.assign(new Error('upstream 503'), { status: 503 }));
    const result = await submitPhoto({ status: 'idle' }, form());
    expect(result.status).toBe('error');
    expect(result.message).toContain('내 제출 목록');
  });

  it('preserves duplicate-safe recovery instructions if owner readback returns a 503', async () => {
    read.mockImplementation(async (path: string) => {
      if (path === '/api/v1/photos/mine') throw Object.assign(new Error('upstream 503'), { status: 503 });
      return { csrfToken: 'synthetic-csrf' };
    });
    const result = await submitPhoto({ status: 'idle' }, form());
    expect(result.status).toBe('error');
    expect(result.message).toContain('내 제출 목록');
  });

});
