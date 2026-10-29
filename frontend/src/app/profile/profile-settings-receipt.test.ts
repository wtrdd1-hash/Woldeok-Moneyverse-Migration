import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mutate, read, revalidate } = vi.hoisted(() => ({
  mutate: vi.fn(),
  read: vi.fn(),
  revalidate: vi.fn(),
}));
vi.mock('@/lib/mutate', () => ({
  mutate,
  failure: (_error: unknown, message: string) => ({ status: 'error', message }),
}));
vi.mock('@/lib/api', () => ({ api: read, apiBytes: vi.fn() }));
vi.mock('next/cache', () => ({ revalidatePath: revalidate }));

import { saveProfile } from './actions';

const stored = {
  visibility: 'private',
  display_name: '안전한 이름',
  image_url: null,
  field_visibility: { imageUrl: 'private', workCompletions: 'private' },
  featured_title: null,
};

function form(): FormData {
  const data = new FormData();
  data.set('visibility', 'private');
  data.set('displayName', '안전한 이름');
  data.set('imageUrl', '');
  data.set('featuredTitle', 'none');
  for (const key of ['profile', 'imageUrl', 'jobType', 'workCompletions', 'featuredTitle']) {
    data.set(
      `field.${key}`,
      key === 'imageUrl' || key === 'workCompletions' ? 'private' : 'inherit',
    );
  }
  return data;
}

beforeEach(() => {
  vi.clearAllMocks();
  mutate.mockResolvedValue({ settings: structuredClone(stored) });
  read.mockResolvedValue({ settings: structuredClone(stored) });
});

describe('member profile privacy save receipts', () => {
  it('does not claim a save when the mutation has no settings receipt', async () => {
    mutate.mockResolvedValue({});
    const result = await saveProfile({ status: 'idle' }, form());
    expect(result.status).toBe('error');
    expect(read).not.toHaveBeenCalled();
    expect(revalidate).not.toHaveBeenCalled();
  });

  it('rejects a mutation receipt with broader privacy than requested', async () => {
    mutate.mockResolvedValue({ settings: { ...stored, visibility: 'public' } });
    const result = await saveProfile({ status: 'idle' }, form());
    expect(result.status).toBe('error');
    expect(read).not.toHaveBeenCalled();
    expect(revalidate).not.toHaveBeenCalled();
  });

  it('rejects a mutation receipt that drops one private field', async () => {
    mutate.mockResolvedValue({
      settings: { ...stored, field_visibility: { imageUrl: 'private' } },
    });
    const result = await saveProfile({ status: 'idle' }, form());
    expect(result.status).toBe('error');
    expect(read).not.toHaveBeenCalled();
  });

  it('does not claim success when readback still has public visibility', async () => {
    read.mockResolvedValue({ settings: { ...stored, visibility: 'public' } });
    const result = await saveProfile({ status: 'idle' }, form());
    expect(result.status).toBe('error');
    expect(read).toHaveBeenCalledWith('/api/v1/profile/settings');
    expect(revalidate).not.toHaveBeenCalled();
  });

  it('rejects a receipt with an unexpected public field override', async () => {
    mutate.mockResolvedValue({
      settings: {
        ...stored,
        field_visibility: { ...stored.field_visibility, featuredTitle: 'public' },
      },
    });
    const result = await saveProfile({ status: 'idle' }, form());
    expect(result.status).toBe('error');
    expect(read).not.toHaveBeenCalled();
  });

  it('rejects a contradictory image or featured title receipt', async () => {
    mutate.mockResolvedValue({
      settings: { ...stored, image_url: 'https://example.test/old.png' },
    });
    expect((await saveProfile({ status: 'idle' }, form())).status).toBe('error');
    mutate.mockResolvedValue({ settings: { ...stored, featured_title: 'helper' } });
    expect((await saveProfile({ status: 'idle' }, form())).status).toBe('error');
    expect(read).not.toHaveBeenCalled();
  });

  it('reports uncertainty if the authenticated readback is unavailable', async () => {
    read.mockRejectedValue(new Error('owner settings read unavailable'));
    const result = await saveProfile({ status: 'idle' }, form());
    expect(result.status).toBe('error');
    expect(result.message).toMatch(/확인하지 못했어요/);
    expect(revalidate).not.toHaveBeenCalled();
  });

  it('does not claim success when the readback is missing', async () => {
    read.mockResolvedValue({});
    const result = await saveProfile({ status: 'idle' }, form());
    expect(result.status).toBe('error');
    expect(revalidate).not.toHaveBeenCalled();
  });

  it('reports success only after mutation and owner readback agree with every field', async () => {
    const result = await saveProfile({ status: 'idle' }, form());
    expect(result.status).toBe('ok');
    expect(read).toHaveBeenCalledWith('/api/v1/profile/settings');
    expect(revalidate).toHaveBeenCalledWith('/profile');
    expect(mutate).toHaveBeenCalledWith('/api/v1/profile', {
      method: 'PUT',
      body: {
        visibility: 'private',
        fieldVisibility: { imageUrl: 'private', workCompletions: 'private' },
        displayName: '안전한 이름',
      },
    });
  });
});
