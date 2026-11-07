import { describe, expect, it, vi } from 'vitest';
import { ContentService } from './content.service';
import { ContentController } from './content.controller';
import { AppContentController } from './app-content.controller';

const id = '2e090c86-3cd8-47ca-b7db-4be7d7b8daad';
const photo = (published_at: string) => ({
  photo_id: id, image_url: '/media/7eede72c-432b-4a45-8ba6-420dd24350c7.jpg',
  alt_text: 'Approved photo', published_at,
});

describe('published gallery month end-to-end backend', () => {
  it('filters the approved 24-photo DB function snapshot by Seoul month', async () => {
    const publishedPhotos = vi.fn().mockResolvedValue([
      photo('2026-10-31T15:00:00Z'),
      {...photo('2026-10-31T14:59:59Z'), photo_id: 'f8b1ec3a-f181-41d3-b7a2-8580f49b3919'},
    ]);
    const repository = Object.fromEntries(['publishedAnnouncements', 'publicStatus', 'saveAnnouncement', 'setAnnouncementImage', 'setAnnouncementPublication', 'savePhoto', 'setPhotoPublication', 'adminListPendingPhotos', 'adminListAllPhotos', 'adminDeletePhoto', 'adminRejectPhoto', 'adminListAllAnnouncements', 'adminDeleteAnnouncement'].map((name) => [name, vi.fn()]));
    const service = new ContentService({ ...repository, publishedPhotos } as never);
    const result = await service.publicPhotos({ month: '2026-11' });
    expect(result).toHaveLength(1);
    expect(result[0]?.publishedAt).toBe('2026-10-31T15:00:00.000Z');
    expect(publishedPhotos).toHaveBeenCalledWith({ limit: 24 });
  });

  it('rejects unknown and duplicate filters before querying DB', async () => {
    const publicPhotos = vi.fn().mockResolvedValue([]);
    const controller = new ContentController({ publicPhotos } as never);
    await expect(controller.photos({ month: ['2026-11', '2026-10'] } as never)).rejects.toThrow();
    await expect(controller.photos({ month: '2026-11', unknown: 'yes' } as never)).rejects.toThrow();
    expect(publicPhotos).not.toHaveBeenCalled();
  });

  it('echoes exact applied filter on public and app API', async () => {
    const publicPhotos = vi.fn().mockResolvedValue([]);
    const publicController = new ContentController({ publicPhotos } as never);
    const appController = new AppContentController({ publicPhotos } as never);
    await expect(publicController.photos({ month: '2026-11' } as never)).resolves.toEqual({ photos: [], month: '2026-11' });
    await expect(appController.photos({ month: '2026-11' } as never)).resolves.toEqual({ photos: [], month: '2026-11' });
    expect(publicPhotos).toHaveBeenCalledWith({ month: '2026-11' });
  });
});
