import { describe, expect, it } from 'vitest';
import { parseGalleryCaptionQuery, isVerifiedCaptionGallery } from './gallery-caption';

describe('public gallery caption discovery', () => {
  it('normalizes safe query text and rejects unsupported search', () => {
    expect(parseGalleryCaptionQuery(undefined)).toBe('');
    expect(parseGalleryCaptionQuery(' 제주 ')).toBe('제주');
    for (const value of [' ', 'a', 'x'.repeat(61), ['제주', '제주'], '제\u0000주']) {
      expect(parseGalleryCaptionQuery(value)).toBeNull();
    }
  });
  it('accepts only matching, bounded and uniquely identified published photo rows', () => {
    const row = { photoId: 'photo-1', altText: '제주 바다', imageUrl: '/media/a.jpg', publishedAt: '2026-11-01T00:00:00Z' };
    expect(isVerifiedCaptionGallery({ photos: [row] }, '제주')).toBe(true);
    expect(isVerifiedCaptionGallery({ photos: [row] }, '부산')).toBe(false);
    expect(isVerifiedCaptionGallery({ photos: [row, row] }, '제주')).toBe(false);
    expect(isVerifiedCaptionGallery({ photos: Array(25).fill(row) }, '제주')).toBe(false);
    expect(isVerifiedCaptionGallery({ photos: [] }, '제주')).toBe(true);
    expect(isVerifiedCaptionGallery({ photos: [{ ...row, altText: 123 }] }, '제주')).toBe(false);
  });
});
