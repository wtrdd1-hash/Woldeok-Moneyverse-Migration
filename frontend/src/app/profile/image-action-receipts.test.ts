import { beforeEach, describe, expect, it, vi } from 'vitest';

const { read, writeBytes, mutate, revalidate } = vi.hoisted(() => ({
  read: vi.fn(), writeBytes: vi.fn(), mutate: vi.fn(), revalidate: vi.fn(),
}));
vi.mock('@/lib/api', () => ({ api: read, apiBytes: writeBytes }));
vi.mock('@/lib/mutate', () => ({ mutate, failure: () => ({ status: 'error', message: 'Unable to confirm change' }) }));
vi.mock('next/cache', () => ({ revalidatePath: revalidate }));

import { removeProfileImage, uploadProfileImage } from './actions';

const path = '/media/profile/90c4e915-2e46-4ed8-bfb7-59b2f4df398a.png';
const fileForm = () => {
  const form = new FormData();
  form.set('image', new File([new Uint8Array([137, 80, 78, 71])], 'avatar.png', { type: 'image/png' }));
  return form;
};

beforeEach(() => {
  vi.clearAllMocks();
  read.mockResolvedValue({ csrfToken: 'csrf-for-test' });
  writeBytes.mockResolvedValue({ imagePath: path });
  mutate.mockResolvedValue(undefined);
});

describe('member profile image persistence receipts', () => {
  it('refuses a successful HTTP upload with no authoritative image path', async () => {
    writeBytes.mockResolvedValue({});
    expect((await uploadProfileImage({ status: 'idle' }, fileForm())).status).toBe('error');
    expect(read).toHaveBeenCalledTimes(1);
    expect(revalidate).not.toHaveBeenCalled();
  });

  it('rejects a cross-origin or malformed upload path before readback', async () => {
    writeBytes.mockResolvedValue({ imagePath: '//outside.example/image.png' });
    expect((await uploadProfileImage({ status: 'idle' }, fileForm())).status).toBe('error');
    expect(read).toHaveBeenCalledTimes(1);
  });

  it('does not claim upload success when owner settings disagree with the receipt', async () => {
    read.mockResolvedValueOnce({ csrfToken: 'csrf-for-test' }).mockResolvedValueOnce({ settings: { image_url: '/media/profile/other.png' } });
    expect((await uploadProfileImage({ status: 'idle' }, fileForm())).status).toBe('error');
    expect(revalidate).not.toHaveBeenCalled();
  });

  it('confirms upload only after the owner readback matches the image path', async () => {
    read.mockResolvedValueOnce({ csrfToken: 'csrf-for-test' }).mockResolvedValueOnce({ settings: { image_url: path } });
    expect((await uploadProfileImage({ status: 'idle' }, fileForm())).status).toBe('ok');
    expect(read).toHaveBeenLastCalledWith('/api/v1/profile/settings');
    expect(revalidate).toHaveBeenCalledWith('/profile');
  });

  it('refuses to claim image removal while owner settings still contain a photo', async () => {
    read.mockResolvedValue({ settings: { image_url: path } });
    expect((await removeProfileImage({ status: 'idle' }, new FormData())).status).toBe('error');
    expect(revalidate).not.toHaveBeenCalled();
  });

  it('refuses removal success when the owner readback is unavailable', async () => {
    read.mockResolvedValue(null);
    expect((await removeProfileImage({ status: 'idle' }, new FormData())).status).toBe('error');
  });

  it('confirms removal only when the owner settings have no image', async () => {
    read.mockResolvedValue({ settings: { image_url: null } });
    expect((await removeProfileImage({ status: 'idle' }, new FormData())).status).toBe('ok');
    expect(read).toHaveBeenCalledWith('/api/v1/profile/settings');
    expect(revalidate).toHaveBeenCalledWith('/profile');
  });
});
