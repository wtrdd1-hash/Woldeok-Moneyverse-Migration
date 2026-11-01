import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { isVerifiedBoardOrderPayload, parseBoardOrder } from './board-order';

describe('board order parsing', () => {
  it('preserves default newest without an explicit filter', () => {
    expect(parseBoardOrder(undefined)).toEqual({ order: 'newest', explicit: false, invalid: false });
  });
  it('accepts newest and oldest only', () => {
    expect(parseBoardOrder('oldest')).toEqual({ order: 'oldest', explicit: true, invalid: false });
    expect(parseBoardOrder('newest')).toEqual({ order: 'newest', explicit: true, invalid: false });
  });
  it.each([['oldest', 'newest'], '', 'random', 1])('rejects ambiguous input %j', value => {
    expect(parseBoardOrder(value).invalid).toBe(true);
  });
});

describe('public board order proof', () => {
  const earlier = { postId: 'one', createdAt: '2026-11-01T01:00:00.000Z' };
  const later = { postId: 'two', createdAt: '2026-11-01T02:00:00.000Z' };
  it('accepts monotonic proof only for the requested direction', () => {
    expect(isVerifiedBoardOrderPayload({ order: 'oldest', posts: [earlier,later] }, 'oldest')).toBe(true);
    expect(isVerifiedBoardOrderPayload({ order: 'newest', posts: [later,earlier] }, 'newest')).toBe(true);
  });
  it.each([
    { order: 'oldest', posts: [later,earlier] },
    { order: 'oldest', posts: [earlier,earlier] },
    { order: 'oldest', posts: Array.from({ length: 51 }, (_,i) => ({ postId: String(i), createdAt: earlier.createdAt })) },
    { order: 'oldest', posts: [{ postId: 'a', createdAt: 'not a timestamp' }] },
    { order: 'newest', posts: [earlier,later] },
    { posts: [earlier,later] },
  ])('rejects unverified result %j', payload => {
    expect(isVerifiedBoardOrderPayload(payload,'oldest')).toBe(false);
  });
  it('requires the web page to validate the proof, not merely trust the echo', () => {
    const page = readFileSync('src/app/board/page.tsx','utf8');
    expect(page).toContain('isVerifiedBoardOrderPayload(data, order.order)');
    expect(page).toContain("params.q === '' && order.explicit");
  });
});
