import { describe, expect, it, vi } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { ContentService } from './content.service';
import { ContentController } from './content.controller';
import { AppContentController } from './app-content.controller';

const ids = [
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222222',
];
function source() {
  return {
    publishedAnnouncements: vi.fn().mockResolvedValue([]),
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
    publishedPhotos: vi.fn().mockResolvedValue([
      { photo_id: ids[0], image_url: 'https://example.org/one.jpg', alt_text: 'One', published_at: new Date('2026-11-01T02:00:00Z') },
      { photo_id: ids[1], image_url: 'https://example.org/two.jpg', alt_text: 'Two', published_at: new Date('2026-11-01T01:00:00Z') },
    ]),
  };
}

describe('verified recent gallery order', () => {
  it('reorders only the already bounded public SQL result, never querying older or private rows', async () => {
    const repository = source();
    const service = new ContentService(repository as never);
    const oldest = await service.publicPhotos({ sort: 'oldest' });
    expect(oldest.map((row) => row.photoId)).toEqual([ids[1], ids[0]]);
    expect(repository.publishedPhotos).toHaveBeenCalledExactlyOnceWith({ limit: 24 });
    expect((await service.publicPhotos()).map((row) => row.photoId)).toEqual(ids);
  });

  it('validates public and Android content controllers consistently', async () => {
    const service = { publicPhotos: vi.fn().mockResolvedValue([]) };
    const web = new ContentController(service as never);
    const android = new AppContentController(service as never);
    await expect(web.photos('oldest')).resolves.toEqual({ photos: [] });
    await expect(android.photos('newest')).resolves.toEqual({ photos: [] });
    expect(service.publicPhotos).toHaveBeenCalledWith({ sort: 'oldest' });
    expect(service.publicPhotos).toHaveBeenCalledWith({ sort: 'newest' });
    for (const invalid of ['old', '', 'OLDEST', ['oldest', 'newest'], 3]) {
      await expect(web.photos(invalid as never)).rejects.toBeInstanceOf(BadRequestException);
      await expect(android.photos(invalid as never)).rejects.toBeInstanceOf(BadRequestException);
    }
  });

  it('does not claim verified sorting when published timestamps are absent', async () => {
    const repository = source();
    repository.publishedPhotos.mockResolvedValueOnce([{ photo_id: ids[0], image_url: 'https://example.org/one.jpg', alt_text: 'One', published_at: null }] as never);
    const service = new ContentService(repository as never);
    await expect(service.publicPhotos({ sort: 'oldest' })).rejects.toThrow();
  });
});
