import { describe, expect, it } from 'vitest';
import { parseAnnouncementOrder, verifiedAnnouncementOrder } from './announcement-order';

const first = { announcementId: '00000000-0000-4000-8000-000000000001', publishedAt: '2026-09-01T00:00:00.000Z' };
const second = { announcementId: '00000000-0000-4000-8000-000000000002', publishedAt: '2026-10-01T00:00:00.000Z' };

describe('Android announcement order evidence', () => {
  it('rejects duplicates, unknown query keys and bad sort', () => {
    expect(parseAnnouncementOrder(new URLSearchParams('sort=oldest'))).toBe('oldest');
    expect(parseAnnouncementOrder(new URLSearchParams('sort=newest'))).toBe('newest');
    expect(parseAnnouncementOrder(new URLSearchParams('sort=pinned'))).toBe('pinned');
    expect(parseAnnouncementOrder(new URLSearchParams())).toBe('pinned');
    for (const input of ['sort=oldest&sort=newest', 'sort=invalid', 'sort=', 'sort=oldest&admin=1']) {
      expect(parseAnnouncementOrder(new URLSearchParams(input))).toBeNull();
    }
  });
  it('fails closed on stale backend ordering and malformed timestamps', () => {
    expect(verifiedAnnouncementOrder({ announcements: [first, second] }, 'oldest')).toBe(true);
    expect(verifiedAnnouncementOrder({ announcements: [second, first] }, 'oldest')).toBe(false);
    expect(verifiedAnnouncementOrder({ announcements: [second, first] }, 'newest')).toBe(true);
    expect(verifiedAnnouncementOrder({ announcements: [{ ...first, publishedAt: null }] }, 'newest')).toBe(false);
    expect(verifiedAnnouncementOrder({ announcements: [first, first] }, 'oldest')).toBe(false);
    expect(verifiedAnnouncementOrder({ announcements: Array(21).fill(first) }, 'newest')).toBe(false);
  });
});
