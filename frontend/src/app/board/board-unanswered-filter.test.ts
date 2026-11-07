import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseBoardUnansweredFilter, isVerifiedUnansweredBoardResponse } from '@/lib/board-unanswered';

const postId = '123e4567-e89b-42d3-a456-426614174000';

describe('unanswered public board discovery', () => {
  it('only accepts the exact optional filter flag', () => {
    expect(parseBoardUnansweredFilter(undefined)).toEqual({ enabled: false, invalid: false });
    expect(parseBoardUnansweredFilter('1')).toEqual({ enabled: true, invalid: false });
    for (const invalid of ['0', '', 'true', ['1','1'], 1]) {
      expect(parseBoardUnansweredFilter(invalid).invalid).toBe(true);
    }
  });
  it('accepts verified zero-reply posts and rejects forged or ambiguous results', () => {
    expect(isVerifiedUnansweredBoardResponse({ posts: [{ postId, commentCount: 0 }], appliedFilters: { unansweredOnly: true, scope: 'latest50' } })).toBe(true);
    expect(isVerifiedUnansweredBoardResponse({ posts: [{ postId, commentCount: 1 }], appliedFilters: { unansweredOnly: true, scope: 'latest50' } })).toBe(false);
    expect(isVerifiedUnansweredBoardResponse({ posts: [{ postId, commentCount: '0' }], appliedFilters: { unansweredOnly: true, scope: 'latest50' } })).toBe(false);
    expect(isVerifiedUnansweredBoardResponse({ posts: [{ postId, commentCount: 0 }, { postId: postId.toUpperCase(), commentCount: 0 }], appliedFilters: { unansweredOnly: true, scope: 'latest50' } })).toBe(false);
    expect(isVerifiedUnansweredBoardResponse({ posts: [], appliedFilters: { unansweredOnly: true, scope: 'latest50' } })).toBe(true);
    expect(isVerifiedUnansweredBoardResponse({ posts: Array.from({ length: 51 }, () => ({ postId, commentCount: 0 })), appliedFilters: { unansweredOnly: true, scope: 'latest50' } })).toBe(false);
    expect(isVerifiedUnansweredBoardResponse({ results: [] })).toBe(false);
    expect(isVerifiedUnansweredBoardResponse({ posts: [] })).toBe(false); // no backend filter attestation
  });
  it('uses a labelled GET control, preserves stock/title filters, and excludes filtered results from SEO', () => {
    const page = readFileSync('src/app/board/page.tsx', 'utf8');
    expect(page).toContain('name="unanswered"');
    expect(page).toContain('value="1"');
    expect(page).toContain("query.set('unanswered', '1')");
    expect(page).toContain('isVerifiedUnansweredBoardResponse');
    expect(page).toContain('최근 공개 게시글 50건');
    expect(page).toContain('robots: { index: !hasSearch');
  });
});
