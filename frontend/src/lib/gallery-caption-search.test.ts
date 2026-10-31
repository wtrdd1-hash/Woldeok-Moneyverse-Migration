import { describe, expect, it } from 'vitest';
import { normalizeGalleryCaptionQuery, parseGalleryCaptionSearch } from './gallery-caption-search';
const row = { photoId: '2e090c86-3cd8-47ca-b7db-4be7d7b8daad', imageUrl: '/media/7eede72c-432b-4a45-8ba6-420dd24350c7.jpg', altText: '제주 바다', publishedAt: '2026-10-30T12:00:00.000Z' };
describe('gallery proof', () => {
  it('rejects ambiguous queries', () => { expect(normalizeGalleryCaptionQuery(' 제주 ')).toBe('제주'); expect(() => normalizeGalleryCaptionQuery(['제주','서울'])).toThrow(); });
  it('rejects stale response, mismatched caption and unsafe media', () => {
    const good = { photos: [row], query: '제주', scope: 'latest_24_published' };
    expect(parseGalleryCaptionSearch(good,'제주')).toEqual(good.photos);
    expect(parseGalleryCaptionSearch({ ...good, query:'서울' },'제주')).toBeNull();
    expect(parseGalleryCaptionSearch({ ...good, photos:[{ ...row, altText:'서울' }] },'제주')).toBeNull();
    expect(parseGalleryCaptionSearch({ ...good, photos:[{ ...row, imageUrl:'javascript:alert(1)' }] },'제주')).toBeNull();
  });
});
