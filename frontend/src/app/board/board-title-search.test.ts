import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseBoardTitleQuery, parseBoardRepliesFilter } from './board-title-search';

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

describe('public board reply-presence filter', () => {
  it('accepts only the two explicit reply filters and defaults to all', () => {
    expect(parseBoardRepliesFilter(undefined)).toEqual({ replies: 'all', invalid: false });
    expect(parseBoardRepliesFilter('with')).toEqual({ replies: 'with', invalid: false });
    expect(parseBoardRepliesFilter('without')).toEqual({ replies: 'without', invalid: false });
  });
  it.each(['', 'all', 'yes', ['with', 'without'], 'with\n'])('rejects invalid replies %j', (value) => {
    expect(parseBoardRepliesFilter(value).invalid).toBe(true);
  });
  it('renders a labeled reply filter and keeps filtered board results unindexed', () => {
    const page = readFileSync('src/app/board/page.tsx', 'utf8');
    expect(page).toContain('name="replies"');
    expect(page).toContain('htmlFor="board-replies"');
    expect(page).toContain('params.replies !== undefined');
    expect(page).toContain('최근 공개 게시글 50건');
  });
});
