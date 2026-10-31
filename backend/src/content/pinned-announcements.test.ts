import { describe, expect, it, vi } from 'vitest';
import { ContentController } from './content.controller';
import { AppContentController } from './app-content.controller';
import { ContentService } from './content.service';

const first = '00000000-0000-4000-8000-000000000001';
const second = '00000000-0000-4000-8000-000000000002';
const rows = [
  {
    announcement_id: first,
    title: 'Pinned notice',
    body: 'Body',
    image_url: null,
    image_alt_text: null,
    is_pinned: true,
    published_at: new Date('2026-11-01T00:00:00Z'),
  },
  {
    announcement_id: second,
    title: 'Regular notice',
    body: 'Body',
    image_url: null,
    image_alt_text: null,
    is_pinned: false,
    published_at: new Date('2026-10-31T00:00:00Z'),
  },
];

function service() {
  const publishedAnnouncements = vi.fn().mockResolvedValue(rows);
  const repository = Object.fromEntries(
    [
      'publishedPhotos',
      'isPublicStorageKey',
      'publicStatus',
      'saveAnnouncement',
      'setAnnouncementImage',
      'setAnnouncementPublication',
      'savePhoto',
      'setPhotoPublication',
      'adminListPendingPhotos',
      'adminListAllPhotos',
      'adminDeletePhoto',
      'adminRejectPhoto',
      'adminListAllAnnouncements',
      'adminDeleteAnnouncement',
      'adminUpdateAnnouncement',
    ].map((key) => [key, vi.fn()]),
  );
  return {
    content: new ContentService({ ...repository, publishedAnnouncements } as never),
    publishedAnnouncements,
  };
}

describe('published pinned notice discovery', () => {
  it('limits the SQL published read first, then filters only pinned notices', async () => {
    const { content, publishedAnnouncements } = service();
    await expect(content.publicAnnouncements({ pinnedOnly: true })).resolves.toEqual([
      expect.objectContaining({ announcementId: first, isPinned: true }),
    ]);
    expect(publishedAnnouncements).toHaveBeenCalledWith({ limit: 20 });
    await expect(content.publicAnnouncements()).resolves.toHaveLength(2);
  });

  it('rejects duplicate, empty, and noncanonical filter values in both public and Android controllers', async () => {
    const { content } = service();
    const publicController = new ContentController(content);
    const appController = new AppContentController(content);
    for (const controller of [publicController, appController]) {
      for (const invalid of [['true', 'false'], '', '1', 'TRUE', 'only']) {
        await expect(controller.announcements(invalid)).rejects.toMatchObject({ status: 400 });
      }
      await expect(controller.announcements('true')).resolves.toEqual({
        announcements: [expect.objectContaining({ announcementId: first, isPinned: true })],
      });
      await expect(controller.announcements(undefined)).resolves.toMatchObject({
        announcements: rows.map(() => expect.any(Object)),
      });
    }
  });
});
