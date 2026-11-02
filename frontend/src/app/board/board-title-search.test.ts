import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { isVerifiedBoardMinimumReplies, parseBoardMinimumReplies, parseBoardTitleQuery } from './board-title-search';

describe('public board title search', () => {
  it('normalizes a bounded title query without inventing a global search', () => {
    expect(parseBoardTitleQuery(undefined)).toEqual({ query: null, invalid: false });
    expect(parseBoardTitleQuery('  제주  ')).toEqual({ query: '제주', invalid: false });
  });
  it.each(['', '   ', ['one', 'two'], 'x'.repeat(81), 'a\nb', '<script>'])(
    'rejects invalid query %j',
    (value) => {
      expect(parseBoardTitleQuery(value).invalid).toBe(true);
    },
  );
  it('renders accessible GET search and states the latest-50 scope, without indexing filtered results', () => {
    const page = readFileSync('src/app/board/page.tsx', 'utf8');
    expect(page).toContain('role="search"');
    expect(page).toContain('name="q"');
    expect(page).toContain('최근 공개 게시글 50건');
    expect(page).toContain('robots: { index: !hasSearch');
  });
});


describe('public board minimum replies', () => {
  it('accepts only explicit 1, 5, 10 thresholds', () => {
    expect(parseBoardMinimumReplies(undefined)).toEqual({ minimum: null, invalid: false });
    expect(parseBoardMinimumReplies('5')).toEqual({ minimum: 5, invalid: false });
    for (const input of ['0', '2', '01', '1.0', ['1', '5'], '']) {
      expect(parseBoardMinimumReplies(input).invalid).toBe(true);
    }
  });
  it('requires exact bounded-source proof even for an empty result', () => {
    expect(isVerifiedBoardMinimumReplies({ posts: [] }, 5)).toBe(false);
    expect(isVerifiedBoardMinimumReplies({ posts: [], filters: { minReplies: 5, scope: 'latest50' } }, 5)).toBe(true);
    expect(isVerifiedBoardMinimumReplies({ posts: [{ postId: '11111111-1111-4111-8111-111111111111', commentCount: 4 }], filters: { minReplies: 5, scope: 'latest50' } }, 5)).toBe(false);
  });
  it('renders a labelled native select and marks filtered pages noindex', () => {
    const page = readFileSync('src/app/board/page.tsx', 'utf8');
    expect(page).toContain('name="minReplies"');
    expect(page).toContain('최근 공개 게시글 50건');
    expect(page).toContain('params.minReplies');
  });
});
