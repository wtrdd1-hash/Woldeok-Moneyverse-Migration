import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseBoardUpdateOrder, isVerifiedBoardUpdateOrder } from './board-update-order';

const a = { postId: '11111111-1111-4111-8111-111111111111', createdAt: '2026-10-01T00:00:00.000Z', updatedAt: '2026-11-01T00:00:00.000Z' };
const b = { postId: '22222222-2222-4222-8222-222222222222', createdAt: '2026-10-25T00:00:00.000Z', updatedAt: null };

describe('public board updated order', () => {
  it('accepts absent or updated, never duplicate or unknown values', () => {
    expect(parseBoardUpdateOrder(undefined)).toEqual({ order: null, invalid: false });
    expect(parseBoardUpdateOrder('updated')).toEqual({ order: 'updated', invalid: false });
    expect(parseBoardUpdateOrder('latest')).toEqual({ order: null, invalid: false });
    for (const value of ['', 'oldest', ['updated', 'updated'], 'UPDATED']) {
      expect(parseBoardUpdateOrder(value).invalid).toBe(true);
    }
  });
  it('verifies source timestamps, order marker, bounded size and canonical duplicate IDs', () => {
    expect(isVerifiedBoardUpdateOrder({ order: 'updated', posts: [a, b] })).toBe(true);
    expect(isVerifiedBoardUpdateOrder({ order: 'updated', posts: [] })).toBe(true);
    expect(isVerifiedBoardUpdateOrder({ posts: [] })).toBe(false);
    expect(isVerifiedBoardUpdateOrder({ order: 'updated', posts: [b, a] })).toBe(false);
    expect(isVerifiedBoardUpdateOrder({ order: 'updated', posts: [a, {...a, postId: a.postId.toUpperCase()}] })).toBe(false);
    expect(isVerifiedBoardUpdateOrder({ order: 'updated', posts: [{...a, updatedAt: 'not-a-date'}] })).toBe(false);
    expect(isVerifiedBoardUpdateOrder({ order: 'updated', posts: Array.from({length: 51}, (_, i) => ({...a, postId: String(i)})) })).toBe(false);
  });
  it('renders labelled update ordering, bounded scope and noindex filtered results', () => {
    const page = readFileSync('src/app/board/page.tsx', 'utf8');
    expect(page).toContain('name="order"');
    expect(page).toContain('최근 수정순');
    expect(page).toContain('<option value="latest">최근 작성순</option>');
    expect(page).toContain('최근 공개 게시글 50건');
    expect(page).toContain('params.order !== undefined');
  });
});
