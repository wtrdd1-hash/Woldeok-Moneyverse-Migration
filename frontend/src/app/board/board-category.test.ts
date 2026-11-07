import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseBoardCategory } from './board-category';

describe('stock discussion category selection', () => {
  it('normalizes an absent category and accepts only supported categories', () => {
    expect(parseBoardCategory(undefined)).toEqual({ category: null, invalid: false });
    expect(parseBoardCategory('question')).toEqual({ category: 'question', invalid: false });
    for (const value of ['analysis', 'journal', 'business', 'system']) {
      expect(parseBoardCategory(value).invalid).toBe(false);
    }
  });
  it.each(['', 'all', 'Analysis', ['analysis', 'question'], 'unknown'])('rejects invalid category %j', (value) => {
    expect(parseBoardCategory(value).invalid).toBe(true);
  });
  it('offers an accessible category selector and keeps filtered pages out of search engines', () => {
    const page = readFileSync('src/app/board/page.tsx', 'utf8');
    expect(page).toContain('name="category"');
    expect(page).toContain('종목 토론 유형');
    expect(page).toContain('params.category');
    expect(page).toContain('index: !hasSearch');
  });
});
