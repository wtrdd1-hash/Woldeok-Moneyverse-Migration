import { describe, expect, it, vi } from 'vitest';
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
