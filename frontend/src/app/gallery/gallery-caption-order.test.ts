import { describe, expect, it } from 'vitest';
import { parseGallerySort, verifiedGalleryCaptionOrder } from './gallery-caption-order';

const A = '2e090c86-3cd8-47ca-b7db-4be7d7b8daad';
const B = '7eede72c-432b-4a45-8ba6-420dd24350c7';
const photo = (photoId: string, altText: string) => ({
  photoId, altText, imageUrl: `/media/${photoId}.jpg`, publishedAt: '2026-11-01T00:00:00.000Z',
});

describe('bounded approved gallery description sort', () => {
  it('accepts only absent or exact caption sort', () => {
    expect(parseGallerySort(undefined)).toEqual({ sort: null, invalid: false });
    expect(parseGallerySort('caption')).toEqual({ sort: 'caption', invalid: false });
    for (const value of ['', 'latest', 'Caption', ['caption', 'caption'], '<script>']) {
      expect(parseGallerySort(value).invalid).toBe(true);
    }
  });

  it('verifies deterministic byte order, unique ids and bounded source payload', () => {
    expect(verifiedGalleryCaptionOrder({ photos: [photo(A, 'Alpha'), photo(B, '바다')] })).toBe(true);
    expect(verifiedGalleryCaptionOrder({ photos: [photo(B, '바다'), photo(A, 'Alpha')] })).toBe(false);
    expect(verifiedGalleryCaptionOrder({ photos: [photo(A, 'Alpha'), photo(A, 'Alpha')] })).toBe(false);
    expect(verifiedGalleryCaptionOrder({ photos: Array.from({ length: 25 }, (_, i) => photo(A, String(i))) })).toBe(false);
    expect(verifiedGalleryCaptionOrder({ photos: [photo(A, '<script>')] })).toBe(false);
    expect(verifiedGalleryCaptionOrder({ photos: [{ ...photo(A, 'Alpha'), imageUrl: '/private/secret' }] })).toBe(false);
    expect(verifiedGalleryCaptionOrder({ photos: [] })).toBe(true);
  });
});
