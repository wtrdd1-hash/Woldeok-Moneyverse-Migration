import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseBoardCategory, isVerifiedBoardCategoryResponse } from '@/lib/board-category';

describe('bounded public stock category search', () => {
  it('accepts only a single known category or an absent filter', () => {
    expect(parseBoardCategory(undefined)).toEqual({ category: null, invalid: false });
    expect(parseBoardCategory('question')).toEqual({ category: 'question', invalid: false });
    for (const value of ['', 'general', ['question','analysis'], '<script>', 'Question']) {
      expect(parseBoardCategory(value).invalid).toBe(true);
    }
  });
  it('requires a backend marker even when zero posts match', () => {
    expect(isVerifiedBoardCategoryResponse({ posts: [], categoryFilter: 'question' }, 'question')).toBe(true);
    expect(isVerifiedBoardCategoryResponse({ posts: [] }, 'question')).toBe(false);
    expect(isVerifiedBoardCategoryResponse({ posts: [{ postId: '11111111-1111-4111-8111-111111111111', stock: { category: 'analysis' } }], categoryFilter: 'question' }, 'question')).toBe(false);
    expect(isVerifiedBoardCategoryResponse({ posts: [{ postId: '11111111-1111-4111-8111-111111111111', stock: { category: 'question' } }, { postId: '11111111-1111-4111-8111-111111111111'.toUpperCase(), stock: { category: 'question' } }], categoryFilter: 'question' }, 'question')).toBe(false);
  });
  it('exposes a labelled accessible category select and noindex filtered pages', () => {
    const page = readFileSync('src/app/board/page.tsx', 'utf8');
    expect(page).toContain('name="category"');
    expect(page).toContain('글 유형');
    expect(page).toContain('params.category');
    expect(page).toContain('index: !hasSearch');
  });
});
