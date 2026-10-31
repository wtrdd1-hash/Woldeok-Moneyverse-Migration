import { describe, expect, it, vi } from 'vitest';
import { ContentService } from './content.service';
import { ContentController } from './content.controller';
import { AppContentController } from './app-content.controller';

const PHOTO = '2e090c86-3cd8-47ca-b7db-4be7d7b8daad';
const IMAGE = '/media/7eede72c-432b-4a45-8ba6-420dd24350c7.jpg';

function service() {
  const publishedPhotos = vi.fn().mockResolvedValue([
    { photo_id: PHOTO, image_url: IMAGE, alt_text: '제주 돌담 사진', published_at: new Date('2026-10-31T10:00:00Z') },
    { photo_id: '24a1c176-6a9e-44f5-bf8e-7a44ac89a4e4', image_url: IMAGE, alt_text: 'Sydney harbour', published_at: new Date('2026-10-30T10:00:00Z') },
  ]);
  const methods = ['publishedAnnouncements', 'publicStatus', 'saveAnnouncement', 'setAnnouncementImage',
    'setAnnouncementPublication', 'savePhoto', 'setPhotoPublication', 'adminListPendingPhotos',
    'adminListAllPhotos', 'adminDeletePhoto', 'adminRejectPhoto', 'adminListAllAnnouncements',
    'adminDeleteAnnouncement'];
  const repository = Object.fromEntries(methods.map(name => [name, vi.fn()]));
  return { content: new ContentService({ ...repository, publishedPhotos } as never), publishedPhotos };
}

describe('public gallery caption search', () => {
  it('searches only the 24 database-approved rows and preserves DB order', async () => {
    const { content, publishedPhotos } = service();
    const result = await content.publicPhotos({ query: '  돌담  ' });
    expect(result.map(row => row.altText)).toEqual(['제주 돌담 사진']);
    expect(publishedPhotos).toHaveBeenCalledWith({ limit: 24 });
  });

  it('uses the same validated search in the public and Android controllers', async () => {
    const { content } = service();
    const web = new ContentController(content);
    const app = new AppContentController(content);
    expect(await web.photos('  SYDNEY  ')).toMatchObject({ searchScope: 'latest_24', searchApplied: true, photos: [{ altText: 'Sydney harbour' }] });
    expect(await app.photos('  SYDNEY  ')).toEqual(await web.photos('  SYDNEY  '));
  });

  it('rejects duplicate, blank, short, control and oversized search terms', async () => {
    const { content } = service();
    const web = new ContentController(content);
    for (const bad of [['제주', '호주'], '', 'a', 'a'.repeat(41), 'ab\ncd', 12]) {
      await expect(web.photos(bad)).rejects.toMatchObject({ status: 400 });
    }
  });
});
