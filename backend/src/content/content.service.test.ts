import { afterEach, describe, expect, it, vi } from 'vitest';
import { ContentService } from './content.service';

const PHOTO_ID = '2e090c86-3cd8-47ca-b7db-4be7d7b8daad';

function repositoryWithPhoto(imageUrl: string) {
  return {
    publishedAnnouncements: vi.fn().mockResolvedValue([]),
    publishedPhotos: vi
      .fn()
      .mockResolvedValue([
        {
          photo_id: PHOTO_ID,
          image_url: imageUrl,
          alt_text: '사진',
          published_at: new Date('2026-09-07T00:00:00Z'),
        },
      ]),
    isPublicStorageKey: vi.fn(),
    publicStatus: vi.fn(),
    saveAnnouncement: vi.fn(),
    setAnnouncementImage: vi.fn(),
    setAnnouncementPublication: vi.fn(),
    savePhoto: vi.fn(),
    setPhotoPublication: vi.fn(),
    adminListPendingPhotos: vi.fn(),
    adminListAllPhotos: vi.fn(),
    adminDeletePhoto: vi.fn(),
    adminRejectPhoto: vi.fn(),
    adminListAllAnnouncements: vi.fn(),
    adminDeleteAnnouncement: vi.fn(),
    adminUpdateAnnouncement: vi.fn(),
  };
}

afterEach(() => {
  vi.useRealTimers();
});

describe('ContentService public photos', () => {
  it('serves an approved same-origin member upload', async () => {
    const imageUrl = '/media/7eede72c-432b-4a45-8ba6-420dd24350c7.jpg';
    const service = new ContentService(repositoryWithPhoto(imageUrl));
    await expect(service.publicPhotos()).resolves.toEqual([
      expect.objectContaining({ photoId: PHOTO_ID, imageUrl }),
    ]);
  });

  it('rejects a malformed internal media path', async () => {
    const service = new ContentService(repositoryWithPhoto('/media/../../secret.jpg'));
    await expect(service.publicPhotos()).rejects.toThrow('unsafe photo image URL');
  });
});


describe('ContentService status freshness contract', () => {
  function repositoryWithStatus(observedAt: Date | null, state = 'operational') {
    const repository = repositoryWithPhoto('/media/7eede72c-432b-4a45-8ba6-420dd24350c7.jpg');
    repository.publicStatus = vi.fn().mockResolvedValue([{
      source_key: 'backend_api', display_name: 'Backend API', state, detail: 'ok', observed_at: observedAt,
    }]);
    return repository;
  }

  it('returns server-owned freshness metadata and never promotes stale health', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-19T04:20:00.000Z'));
    const fresh = new ContentService(repositoryWithStatus(new Date('2026-09-19T04:19:00.000Z')));
    await expect(fresh.serviceStatus()).resolves.toEqual([expect.objectContaining({
      state: 'operational', freshnessState: 'fresh', ageMs: 60_000, policyVersion: 'status-v1',
    })]);
    const stale = new ContentService(repositoryWithStatus(new Date('2026-09-19T04:18:59.999Z')));
    await expect(stale.serviceStatus()).resolves.toEqual([expect.objectContaining({
      state: 'unknown', freshnessState: 'stale', ageMs: 60_001, policyVersion: 'status-v1',
    })]);
  });

  it('fails closed for observations beyond the allowed future skew', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-19T04:20:00.000Z'));
    const service = new ContentService(repositoryWithStatus(new Date('2026-09-19T04:20:05.001Z')));
    await expect(service.serviceStatus()).resolves.toEqual([expect.objectContaining({
      state: 'unknown', freshnessState: 'unknown', ageMs: null, policyVersion: 'status-v1',
    })]);
  });
});
describe('ContentService published announcement title search', () => {
  it('filters only the canonical latest published rows by literal case-insensitive title', async () => {
    const repository = repositoryWithPhoto('/media/7eede72c-432b-4a45-8ba6-420dd24350c7.jpg');
    repository.publishedAnnouncements = vi.fn().mockResolvedValue([
      {
        announcement_id: 'c42c6218-8907-4eb1-94b9-53e2bfc97a0c',
        title: '월덕 공지', body: '안내', image_url: null, image_alt_text: null,
        is_pinned: true, published_at: new Date('2026-10-31T02:00:00Z'),
      },
      {
        announcement_id: '11a72b77-b15b-4d36-a44f-0b4f2d51e702',
        title: '월덕 업데이트', body: '안내', image_url: null, image_alt_text: null,
        is_pinned: false, published_at: new Date('2026-10-31T01:00:00Z'),
      },
    ]);
    const service = new ContentService(repository);
    const result = await service.publicAnnouncements({ q: '공지' });
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ title: '월덕 공지', isPinned: true });
    expect(repository.publishedAnnouncements).toHaveBeenCalledWith({ limit: 20 });
  });
});
