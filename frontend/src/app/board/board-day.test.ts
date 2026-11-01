import { describe, expect, it } from 'vitest';
import { parseBoardDay, isVerifiedBoardDayResponse } from './board-day';

describe('public board Seoul-day search', () => {
  it('accepts canonical Gregorian dates and excludes invalid calendar days', () => {
    expect(parseBoardDay(undefined)).toEqual({ day: null, invalid: false });
    expect(parseBoardDay('2026-11-01')).toEqual({ day: '2026-11-01', invalid: false });
    for (const value of ['2026-02-30', '2026-2-1', ['2026-11-01', '2026-11-02'], '', '1900-01-01']) {
      expect(parseBoardDay(value).invalid).toBe(true);
    }
  });
  it('rejects a stale HTTP 200 with a post from the wrong Seoul day', () => {
    const post = { postId: '11111111-1111-4111-8111-111111111111', createdAt: '2026-10-31T15:01:00.000Z' };
    expect(isVerifiedBoardDayResponse({ posts: [post], appliedDay: '2026-11-01' }, '2026-11-01')).toBe(true);
    expect(isVerifiedBoardDayResponse({ posts: [{ ...post, createdAt: '2026-10-31T14:59:59.999Z' }], appliedDay: '2026-11-01' }, '2026-11-01')).toBe(false);
    expect(isVerifiedBoardDayResponse({ posts: [post, post], appliedDay: '2026-11-01' }, '2026-11-01')).toBe(false);
    expect(isVerifiedBoardDayResponse({ posts: [], appliedDay: '2026-11-01' }, '2026-11-01')).toBe(true);
    expect(isVerifiedBoardDayResponse({ posts: null, appliedDay: '2026-11-01' }, '2026-11-01')).toBe(false);
  });
});
