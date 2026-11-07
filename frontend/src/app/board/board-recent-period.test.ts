import { describe, expect, it } from 'vitest';
import { parseBoardRecentPeriod, verifiedBoardRecentPeriod } from './board-recent-period';

const id = 'a1f7c2a3-1b22-4c33-8d44-a55566667777';
const now = Date.now();
const cutoff = new Date(now - 7 * 86_400_000).toISOString();

describe('public board UTC recent period', () => {
  it('accepts only the three bounded periods', () => {
    expect(parseBoardRecentPeriod(undefined)).toEqual({ period: null, invalid: false });
    expect(parseBoardRecentPeriod('7d')).toEqual({ period: '7d', invalid: false });
    expect(parseBoardRecentPeriod('24h')).toEqual({ period: '24h', invalid: false });
    expect(parseBoardRecentPeriod('30d')).toEqual({ period: '30d', invalid: false });
    expect(parseBoardRecentPeriod(['7d', '30d'])).toEqual({ period: null, invalid: true });
    expect(parseBoardRecentPeriod('week')).toEqual({ period: null, invalid: true });
  });

  it('requires cutoff proof even when filtered results are empty', () => {
    expect(verifiedBoardRecentPeriod({ posts: [] }, '7d', now)).toBe(false);
    expect(verifiedBoardRecentPeriod({ posts: [], period: '7d', cutoffUtc: cutoff }, '7d', now)).toBe(true);
    expect(verifiedBoardRecentPeriod({ posts: [], period: '30d', cutoffUtc: cutoff }, '7d', now)).toBe(false);
  });

  it('rejects stale, future, duplicate and out-of-window post evidence', () => {
    const row = { postId: id, title: 'News', createdAt: new Date(now - 86_400_000).toISOString(), stock: null };
    const base = { period: '7d', cutoffUtc: cutoff };
    expect(verifiedBoardRecentPeriod({ ...base, posts: [row] }, '7d', now)).toBe(true);
    expect(verifiedBoardRecentPeriod({ ...base, posts: [row, { ...row, postId: id.toUpperCase() }] }, '7d', now)).toBe(false);
    expect(verifiedBoardRecentPeriod({ ...base, posts: [{ ...row, createdAt: new Date(now - 8 * 86_400_000).toISOString() }] }, '7d', now)).toBe(false);
    expect(verifiedBoardRecentPeriod({ ...base, posts: [{ ...row, createdAt: new Date(now + 10 * 86_400_000).toISOString() }] }, '7d', now)).toBe(false);
    expect(verifiedBoardRecentPeriod({ ...base, cutoffUtc: new Date(now - 8 * 86_400_000).toISOString(), posts: [] }, '7d', now)).toBe(false);
  });
});
