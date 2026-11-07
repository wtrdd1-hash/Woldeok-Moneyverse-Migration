import { describe, expect, it, vi } from 'vitest';
import { ContentController } from './content.controller';
import { AppContentController } from './app-content.controller';
import { ContentService } from './content.service';
import { PostgresContentRepository } from './content.repository';

const IMAGE = { announcement_id: 'e0b4d58d-4b10-47cc-9894-46eb3d2d1718', title: 'Image notice', body: 'Body', image_url: '/media/e0b4d58d-4b10-47cc-9894-46eb3d2d1718.jpg', image_alt_text: 'photo', is_pinned: false, published_at: new Date('2026-09-01T00:00:00Z') };
const TEXT = { ...IMAGE, announcement_id: 'b3abeb2b-3a10-44c8-9b55-8b45017e86b8', image_url: null, image_alt_text: null };

describe('public announcement image-only filter', () => {
  it('uses the bounded published-only database function before image filtering', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [IMAGE] });
    const repository = new PostgresContentRepository({ query } as never);
    await repository.publishedAnnouncements({ limit: 20, imageOnly: true });
    expect(query).toHaveBeenCalledWith(expect.stringContaining('content_list_published_announcements($1)'), [20, true]);
    expect(query.mock.calls[0]?.[0]).toContain('image_url IS NOT NULL');
  });
  it('filters only approved image rows without altering the default list', async () => {
    const repository = { publishedAnnouncements: vi.fn().mockResolvedValue([IMAGE, TEXT]) };
    const service = new ContentService({ ...repository, publishedPhotos: vi.fn(), isPublicStorageKey: vi.fn(), publicStatus: vi.fn(), saveAnnouncement: vi.fn(), setAnnouncementImage: vi.fn(), setAnnouncementPublication: vi.fn(), savePhoto: vi.fn(), setPhotoPublication: vi.fn(), adminListPendingPhotos: vi.fn(), adminListAllPhotos: vi.fn(), adminDeletePhoto: vi.fn(), adminRejectPhoto: vi.fn(), adminListAllAnnouncements: vi.fn(), adminDeleteAnnouncement: vi.fn(), adminUpdateAnnouncement: vi.fn() });
    await service.publicAnnouncements({ imageOnly: true });
    expect(repository.publishedAnnouncements).toHaveBeenCalledWith({ limit: 20, imageOnly: true });
  });
  it('rejects invalid, duplicate and unknown parameters without reaching the repository', async () => {
    const publicAnnouncements = vi.fn().mockResolvedValue([IMAGE]);
    const controller = new ContentController({ publicAnnouncements } as never);
    for (const q of [{ withImage: 'true' }, { withImage: ['1', '1'] }, { withImage: '1', extra: 'x' }]) {
      await expect(controller.announcements(q)).rejects.toThrow();
    }
    expect(publicAnnouncements).not.toHaveBeenCalled();
    const app = new AppContentController({ publicAnnouncements } as never);
    await expect(app.announcements({ withImage: '1' })).resolves.toMatchObject({ filterApplied: 'with-image' });
    await expect(controller.announcements({ withImage: '1' })).resolves.toMatchObject({ filterApplied: 'with-image' });
  });
});
