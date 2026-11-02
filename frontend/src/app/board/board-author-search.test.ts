import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseBoardAuthorQuery, verifiedBoardAuthorResults } from './board-author-search';

describe('public author discovery', () => {
  it('normalizes literal Korean and special wildcard author names', () => {
    expect(parseBoardAuthorQuery(undefined)).toEqual({ query: null, invalid: false });
    expect(parseBoardAuthorQuery('  홍 %_  ')).toEqual({ query: '홍 %_', invalid: false });
  });
  it.each(['', '  ', ['a', 'b'], 'x'.repeat(81), 'a\nb', '<bad>'])(
    'rejects invalid author query %j', value => {
      expect(parseBoardAuthorQuery(value).invalid).toBe(true);
    },
  );
  it('requires source evidence even when posts are empty', () => {
    expect(verifiedBoardAuthorResults({ posts: [] }, '홍')).toBe(false);
    expect(verifiedBoardAuthorResults({ posts: [], authorFilterApplied: '홍', sourceWindow: 50 }, '홍')).toBe(true);
  });
  it('rejects mismatched authors, duplicate IDs and malformed records', () => {
    const item = { postId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', authorName: '홍길동',
      title: '안내', createdAt: '2026-11-02T10:00:00.000Z', commentCount: 0 };
    const envelope = { authorFilterApplied: '홍', sourceWindow: 50 };
    expect(verifiedBoardAuthorResults({ ...envelope, posts: [item] }, '홍')).toBe(true);
    expect(verifiedBoardAuthorResults({ ...envelope, posts: [{ ...item, authorName: '김' }] }, '홍')).toBe(false);
    expect(verifiedBoardAuthorResults({ ...envelope, posts: [item, { ...item, postId: item.postId.toUpperCase() }] }, '홍')).toBe(false);
    expect(verifiedBoardAuthorResults({ ...envelope, posts: [{ ...item, commentCount: -1 }] }, '홍')).toBe(false);
  });
  it('offers an accessible author input and blocks indexing filtered SSR results', () => {
    const page = readFileSync('src/app/board/page.tsx', 'utf8');
    expect(page).toContain('name="author"');
    expect(page).toContain('htmlFor="board-author-query"');
    expect(page).toContain('params.author !== undefined');
    expect(page).toContain('verifiedBoardAuthorResults');
  });
});
