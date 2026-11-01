import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const page = readFileSync('src/app/board/page.tsx', 'utf8');
const gateway = readFileSync('src/app/app-api/v1/[...path]/route.ts', 'utf8');

describe('accessible popular board discovery and SEO boundaries', () => {
  it('keeps a labelled 44px keyboard-native sort selector and truthful latest-50 scope', () => {
    expect(page).toContain('htmlFor="board-sort"');
    expect(page).toContain('id="board-sort"');
    expect(page).toContain('name="sort"');
    expect(page).toContain('<option value="recent">최신 글</option>');
    expect(page).toContain('<option value="popular">댓글 많은 글</option>');
    expect(page).toContain("defaultValue={sort.enabled ? 'popular' : 'recent'}");
    expect(page).toContain('min-h-11 rounded-md border');
    expect(page).toContain('aria-describedby="board-search-scope"');
    expect(page).toContain('최근 공개 게시글 50건');
  });
  it('preserves stock/title search and blocks indexing of query-specific responses', () => {
    expect(page).toContain("if (stock) query.set('stock', stock)");
    expect(page).toContain("if (search.query) query.set('q', search.query)");
    expect(page).toContain("if (sort.enabled) query.set('sort', 'popular')");
    expect(page).toContain('params.sort !== undefined');
    expect(page).toContain('robots: { index: !hasSearch');
    expect(page).toContain('isVerifiedPopularBoardResponse(rawData)');
    expect(gateway).toContain("request.nextUrl.searchParams.has('sort')");
    expect(gateway).toContain("response.headers.set('x-robots-tag', 'noindex')");
  });
});
