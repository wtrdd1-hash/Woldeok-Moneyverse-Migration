import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseBoardStance, verifiedBoardStanceResponse } from '@/lib/board-stance';

describe('board stock stance filter', () => {
  it('validates single enum stance and all default', () => {
    expect(parseBoardStance(undefined)).toEqual({ stance: null, invalid: false });
    expect(parseBoardStance('all')).toEqual({ stance: null, invalid: false });
    expect(parseBoardStance('bullish')).toEqual({ stance: 'bullish', invalid: false });
    expect(parseBoardStance(['bullish', 'bearish']).invalid).toBe(true);
    expect(parseBoardStance('').invalid).toBe(true);
  });
  it('fails closed on missing proof, mismatched rows and duplicate identifiers', () => {
    const id = '123e4567-e89b-42d3-a456-426614174000';
    const row = { postId: id, stock: { stance: 'bullish' } };
    expect(verifiedBoardStanceResponse({ posts: [row] }, 'bullish')).toBe(false);
    expect(verifiedBoardStanceResponse({ posts: [row], appliedStance: { value: 'bullish', scope: 'latest50' } }, 'bullish')).toBe(true);
    expect(verifiedBoardStanceResponse({ posts: [row, row], appliedStance: { value: 'bullish', scope: 'latest50' } }, 'bullish')).toBe(false);
    expect(verifiedBoardStanceResponse({ posts: [{ ...row, stock: null }], appliedStance: { value: 'bullish', scope: 'latest50' } }, 'bullish')).toBe(false);
    expect(verifiedBoardStanceResponse({ posts: [row], appliedStance: { value: 'bullish', scope: 'latest50' } }, 'bullish', 'WDX')).toBe(false);
  });
  it('uses accessible GET selector, bound scope and noindex metadata', () => {
    const page = readFileSync('src/app/board/page.tsx', 'utf8');
    expect(page).toContain('name="stance"');
    expect(page).toContain('최근 공개 게시글 50건');
    expect(page).toContain('params.stance !== undefined');
    expect(page).toContain('verifiedBoardStanceResponse');
  });
});
