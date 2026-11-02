import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseBoardImageDescription, verifiedImageDescriptionResults } from './board-image-description';

describe('public image-description discovery', () => {
  it('normalizes a literal search within the latest public snapshot', () => {
    expect(parseBoardImageDescription(undefined)).toEqual({ query: null, invalid: false });
    expect(parseBoardImageDescription('  제주 %_  ')).toEqual({ query: '제주 %_', invalid: false });
  });
  it.each(['', '  ', ['a', 'b'], 'a\nb', '<script>', 'x'.repeat(81)])('rejects invalid query %j', (value) => {
    expect(parseBoardImageDescription(value).invalid).toBe(true);
  });
  it('requires exact server filter proof and image-bearing bounded rows', () => {
    const row = { postId: '00000000-0000-4000-8000-000000000001', hasImage: true };
    expect(verifiedImageDescriptionResults({ posts: [row], appliedImageAltQuery: 'sunset' }, 'sunset')).toBe(true);
    expect(verifiedImageDescriptionResults({ posts: [row] }, 'sunset')).toBe(false);
    expect(verifiedImageDescriptionResults({ posts: [{ ...row, hasImage: false }], appliedImageAltQuery: 'sunset' }, 'sunset')).toBe(false);
    expect(verifiedImageDescriptionResults({ posts: [row], appliedImageAltQuery: 'sun' }, 'sunset')).toBe(false);
  });
  it('has a labelled accessible GET field and honest latest-50 scope', () => {
    const page = readFileSync('src/app/board/page.tsx', 'utf8');
    expect(page).toContain('name="alt"');
    expect(page).toContain('이미지 설명 검색');
    expect(page).toContain('최근 공개 게시글 50건');
  });
});
