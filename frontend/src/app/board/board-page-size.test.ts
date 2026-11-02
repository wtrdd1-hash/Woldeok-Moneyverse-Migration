import { describe, expect, it } from 'vitest';
import { isVerifiedBoardPageSizeResponse, parseBoardPageSize } from '@/lib/board-page-size';

const id = '123e4567-e89b-42d3-a456-426614174000';
const sample = { postId: id, title: 'Hello', authorName: 'Alice', createdAt: '2026-11-02T08:00:00.000Z', commentCount: 0, stock: null };

describe('public board bounded display size', () => {
  it('accepts only 10, 25 or 50, and defaults to the full recent-50 window', () => {
    expect(parseBoardPageSize(undefined)).toBe(50);
    for (const value of ['10', '25', '50']) expect(parseBoardPageSize(value)).toBe(Number(value));
    for (const value of ['', '0', '11', '100', '010', ['10', '25'], 10, null]) expect(parseBoardPageSize(value)).toBeNull();
  });
  it('requires explicit source proof even for an empty successful response', () => {
    expect(isVerifiedBoardPageSizeResponse({ posts: [], limitApplied: 10, sourceWindow: 50 }, 10)).toBe(true);
    expect(isVerifiedBoardPageSizeResponse({ posts: [] }, 10)).toBe(false);
    expect(isVerifiedBoardPageSizeResponse({ posts: [], limitApplied: 25, sourceWindow: 50 }, 10)).toBe(false);
  });
  it('rejects oversized, duplicate, malformed or out-of-order post responses', () => {
    expect(isVerifiedBoardPageSizeResponse({ posts: [sample], limitApplied: 10, sourceWindow: 50 }, 10)).toBe(true);
    expect(isVerifiedBoardPageSizeResponse({ posts: Array.from({ length: 11 }, (_, i) => ({ ...sample, postId: id.slice(0, -2) + String(i).padStart(2, '0') })), limitApplied: 10, sourceWindow: 50 }, 10)).toBe(false);
    expect(isVerifiedBoardPageSizeResponse({ posts: [sample, { ...sample, postId: id.toUpperCase() }], limitApplied: 10, sourceWindow: 50 }, 10)).toBe(false);
    expect(isVerifiedBoardPageSizeResponse({ posts: [{ ...sample, commentCount: -1 }], limitApplied: 10, sourceWindow: 50 }, 10)).toBe(false);
  });
});
