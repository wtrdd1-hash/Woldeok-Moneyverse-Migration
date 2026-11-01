import { describe, expect, it } from 'vitest';
import { parseGalleryMonth, isVerifiedGalleryMonthResponse } from './gallery-month';

const photo = (publishedAt: string, photoId = '2e090c86-3cd8-47ca-b7db-4be7d7b8daad') =>
  ({ photoId, imageUrl: '/media/7eede72c-432b-4a45-8ba6-420dd24350c7.jpg', altText: 'approved', publishedAt });

describe('gallery month web and Android contract', () => {
  it('rejects ambiguous/invalid month and accepts canonical value', () => {
    expect(parseGalleryMonth('2026-11')).toBe('2026-11');
    expect(parseGalleryMonth(undefined)).toBeNull();
    expect(parseGalleryMonth(['2026-11', '2026-10'])).toBe('INVALID');
    expect(parseGalleryMonth('2026-00')).toBe('INVALID');
  });
  it('requires exact applied month and Seoul timestamps', () => {
    expect(isVerifiedGalleryMonthResponse({ month: '2026-11', photos: [photo('2026-10-31T15:00:00Z')] }, '2026-11')).toBe(true);
    expect(isVerifiedGalleryMonthResponse({ photos: [] }, '2026-11')).toBe(false);
    expect(isVerifiedGalleryMonthResponse({ month: '2026-11', photos: [photo('2026-10-31T14:59:59Z')] }, '2026-11')).toBe(false);
    expect(isVerifiedGalleryMonthResponse({ month: '2026-11', photos: [photo('2026-10-31T15:00:00Z'), photo('2026-10-31T15:00:00Z')] }, '2026-11')).toBe(false);
    expect(isVerifiedGalleryMonthResponse({ month: '2026-11', photos: [{...photo('2026-10-31T15:00:00Z'), publishedAt: null}] }, '2026-11')).toBe(false);
  });
});
