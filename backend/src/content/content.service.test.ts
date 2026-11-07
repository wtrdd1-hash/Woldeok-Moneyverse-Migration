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
describe('published gallery Seoul-day filter', () => {
  const image = '/media/7eede72c-432b-4a45-8ba6-420dd24350c7.jpg';
  it('selects the KST day from the existing bounded approved-public PostgreSQL read', async () => {
    const repository = repositoryWithPhoto(image);
    repository.publishedPhotos.mockResolvedValue([
      { photo_id: PHOTO_ID, image_url: image, alt_text: 'before midnight', published_at: new Date('2026-09-06T14:59:59.999Z') },
      { photo_id: '1d5a6db0-c657-4f93-9538-52923c0d56f1', image_url: image, alt_text: 'after midnight', published_at: new Date('2026-09-06T15:00:00.000Z') },
      { photo_id: '88f46e87-c632-4bc1-8f7b-fb29e563be53', image_url: image, alt_text: 'next day', published_at: new Date('2026-09-07T15:00:00.000Z') },
    ]);
    const service = new ContentService(repository);
    await expect(service.publicPhotos({ day: '2026-09-07' })).resolves.toEqual([
      expect.objectContaining({ altText: 'after midnight' }),
    ]);
    expect(repository.publishedPhotos).toHaveBeenCalledWith({ limit: 24 });
  });
  it.each(['2026-02-30', '2025-02-29', '2026-9-07', '2026-09-07Z', '', ['2026-09-07', '2026-09-08']])(
    'rejects malformed or duplicate gallery day %s', async (day) => {
      const service = new ContentService(repositoryWithPhoto(image));
      await expect(service.publicPhotos({ day })).rejects.toThrow();
    },
  );
});
