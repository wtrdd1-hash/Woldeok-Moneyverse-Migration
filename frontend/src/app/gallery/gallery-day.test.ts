import { describe, expect, it } from 'vitest';
import { isVerifiedGalleryDayResponse, parseGalleryDay } from './gallery-day';

const photo = {
  photoId: '2e090c86-3cd8-47ca-b7db-4be7d7b8daad',
  imageUrl: '/media/7eede72c-432b-4a45-8ba6-420dd24350c7.jpg',
  altText: 'Approved photo',
  publishedAt: '2026-09-06T15:00:00.000Z',
};

describe('Seoul gallery publication day', () => {
  it('validates Gregorian days, including leap days', () => {
    expect(parseGalleryDay('2024-02-29')).toBe('2024-02-29');
    for (const value of ['2026-02-29', '2026-02-30', '2026-9-07', '2026-09-07Z', '', ['2026-09-07']]) {
      expect(parseGalleryDay(value)).toBeNull();
    }
  });
  it('verifies every published photo is from the requested KST day', () => {
    expect(isVerifiedGalleryDayResponse({ photos: [photo] }, '2026-09-07')).toBe(true);
    expect(isVerifiedGalleryDayResponse({ photos: [photo] }, '2026-09-06')).toBe(false);
    expect(isVerifiedGalleryDayResponse({ photos: [{ ...photo, publishedAt: null }] }, '2026-09-07')).toBe(false);
    expect(isVerifiedGalleryDayResponse({ photos: [{ ...photo, publishedAt: '2026-09-07' }] }, '2026-09-07')).toBe(false);
    expect(isVerifiedGalleryDayResponse({ photos: [{ ...photo, imageUrl: 'javascript:alert(1)' }] }, '2026-09-07')).toBe(false);
    expect(isVerifiedGalleryDayResponse({ photos: Array.from({ length: 25 }, () => photo) }, '2026-09-07')).toBe(false);
    expect(isVerifiedGalleryDayResponse({ photos: [] }, '2026-09-07')).toBe(true);
    expect(isVerifiedGalleryDayResponse({ photos: 'missing' }, '2026-09-07')).toBe(false);
  });
});
