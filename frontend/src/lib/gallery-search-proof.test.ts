import { describe, expect, it } from 'vitest';
import { normalizeGalleryQuery, verifiedGallerySearch } from './gallery-search-proof';

const row = { photoId: '2e090c86-3cd8-47ca-b7db-4be7d7b8daad', imageUrl: '/media/photo.jpg', altText: '제주 돌담', publishedAt: '2026-10-31T10:00:00.000Z' };

describe('public gallery search proof', () => {
  it('validates Unicode search terms and rejects duplicate or malformed terms', () => {
    expect(normalizeGalleryQuery(' 제주 ')).toBe('제주');
    expect(normalizeGalleryQuery(['제주', '호주'])).toBeNull();
    expect(normalizeGalleryQuery('a')).toBeNull();
    expect(normalizeGalleryQuery('a'.repeat(41))).toBeNull();
    expect(normalizeGalleryQuery('제\n주')).toBeNull();
  });
  it('rejects unfiltered, overlong or forged successful results', () => {
    expect(verifiedGallerySearch({ photos: [row], searchScope: 'latest_24', searchApplied: true }, '돌담')).toEqual([row]);
    expect(verifiedGallerySearch({ photos: [row] }, '돌담')).toBeNull();
    expect(verifiedGallerySearch({ photos: [row], searchScope: 'latest_24', searchApplied: true }, 'Sydney')).toBeNull();
    expect(verifiedGallerySearch({ photos: Array(25).fill(row), searchScope: 'latest_24', searchApplied: true }, '돌담')).toBeNull();
  });
});
