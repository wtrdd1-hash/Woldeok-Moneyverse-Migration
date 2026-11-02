import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseBoardSymbolOrder } from './board-symbol-order';

describe('public board stock-symbol ordering', () => {
  it('accepts default and opt-in ordering without allowing ambiguous values', () => {
    expect(parseBoardSymbolOrder(undefined)).toEqual({ sort: 'recent', invalid: false });
    expect(parseBoardSymbolOrder('recent')).toEqual({ sort: 'recent', invalid: false });
    expect(parseBoardSymbolOrder('stock-symbol')).toEqual({ sort: 'stock-symbol', invalid: false });
    expect(parseBoardSymbolOrder(['recent', 'stock-symbol']).invalid).toBe(true);
    expect(parseBoardSymbolOrder('oldest').invalid).toBe(true);
  });
  it('provides an accessible GET sort selector and marks sorted results noindex', () => {
    const page = readFileSync('src/app/board/page.tsx', 'utf8');
    expect(page).toContain('name="sort"');
    expect(page).toContain('종목 코드순');
    expect(page).toContain("query.set('sort', 'stock-symbol')");
    expect(page).toContain('robots: { index: !hasSearch');
    expect(page).toContain('최근 공개 게시글 50건');
  });
});
