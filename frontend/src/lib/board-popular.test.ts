import { describe, expect, it } from 'vitest';
import { isVerifiedPopularBoardResponse, parseBoardPopularSort } from './board-popular';

const id1 = '123e4567-e89b-42d3-a456-426614174001';
const id2 = '123e4567-e89b-42d3-a456-426614174002';
const post = (postId: string, commentCount: number, createdAt = '2026-11-01T12:00:00.000Z') => ({
  postId, commentCount, createdAt,
});
const payload = (posts: unknown) => ({ posts, appliedSort: { order: 'popular', scope: 'latest50' } });

describe('bounded popular board proof', () => {
  it('accepts only one explicit popular sort', () => {
    expect(parseBoardPopularSort(undefined)).toEqual({ enabled: false, invalid: false });
    expect(parseBoardPopularSort('popular')).toEqual({ enabled: true, invalid: false });
    expect(parseBoardPopularSort(['popular', 'popular']).invalid).toBe(true);
    expect(parseBoardPopularSort('recent').invalid).toBe(true);
  });
  it('accepts descending replies, newest-first tie, and verified empty snapshot', () => {
    expect(isVerifiedPopularBoardResponse(payload([post(id1, 3), post(id2, 1)]))).toBe(true);
    expect(isVerifiedPopularBoardResponse(payload([]))).toBe(true);
  });
  it.each([
    payload([post(id1, 1), post(id2, 2)]),
    payload([post(id1, 2, '2026-11-01T10:00:00Z'), post(id2, 2)]),
    payload([post(id1, 1), post(id1.toUpperCase(), 0)]),
    payload([post(id1, -1)]),
    payload([post(id1, Number.MAX_SAFE_INTEGER + 1)]),
    payload([post(id1, 1, 'not-a-date')]),
    { posts: [] },
    payload(Array.from({ length: 51 }, (_, i) => post(`123e4567-e89b-42d3-a456-${String(i).padStart(12, '0')}`, 0))),
  ])('refuses unverified or malformed success-shaped results', (value) => {
    expect(isVerifiedPopularBoardResponse(value)).toBe(false);
  });
});
