import { describe, expect, it, vi } from 'vitest';
import { ContentController } from './content.controller';
import { ContentService, normalizeGalleryCaptionQuery } from './content.service';
const row = { photo_id: '2e090c86-3cd8-47ca-b7db-4be7d7b8daad', image_url: '/media/7eede72c-432b-4a45-8ba6-420dd24350c7.jpg', alt_text: '제주 바다', published_at: new Date('2026-10-30T12:00:00Z') };
describe('gallery search', () => {
  it('rejects duplicate, unsafe and overlong queries', () => {
    expect(normalizeGalleryCaptionQuery('  제주  ')).toBe('제주');
    for (const q of [['제주','서울'],'x','  ','<img>','x'.repeat(41)]) expect(() => normalizeGalleryCaptionQuery(q)).toThrow();
  });
  it('reads only published rows from bounded SQL and returns exact query proof', async () => {
    const publishedPhotos = vi.fn().mockResolvedValue([row]);
    const repository = new Proxy({ publishedPhotos }, { get(target, key) { return key === 'publishedPhotos' ? target.publishedPhotos : vi.fn(); } });
    const controller = new ContentController(new ContentService(repository as never));
    await expect(controller.photos('제주')).resolves.toMatchObject({ query: '제주', scope: 'latest_24_published', photos: [expect.objectContaining({ altText: '제주 바다' })] });
    expect(publishedPhotos).toHaveBeenCalledWith({ limit: 24 });
    await expect(controller.photos(['제주','서울'])).rejects.toThrow();
  });
});
