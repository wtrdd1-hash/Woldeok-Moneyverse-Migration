import { describe, expect, it } from 'vitest';
import { parseAnnouncementRecencyQuery, verifiedAnnouncementRecency } from './announcement-recency';

const NOW = Date.parse('2026-11-03T00:00:00.000Z');
const id = '64fd119b-f4d4-466f-bd37-5ee296a1474b';
const payload = {
  recentApplied: '7d', scope: 'latest-20-published', asOfUtc: new Date(NOW).toISOString(),
  announcements: [{ announcementId: id, title: '공지', publishedAt: '2026-10-27T00:00:00.000Z' }],
};

describe('announcement recency contract', () => {
  it('accepts only a single supported query value', () => {
    expect(parseAnnouncementRecencyQuery(undefined)).toBeNull();
    expect(parseAnnouncementRecencyQuery('7d')).toBe('7d');
    expect(parseAnnouncementRecencyQuery('30d')).toBe('30d');
    expect(parseAnnouncementRecencyQuery(['7d', '30d'])).toBe('invalid');
    expect(parseAnnouncementRecencyQuery('7D')).toBe('invalid');
  });
  it('requires verified backend scope and matching age on Android and web', () => {
    expect(verifiedAnnouncementRecency(payload, '7d', NOW)).toBe(true);
    expect(verifiedAnnouncementRecency({...payload, recentApplied: null}, '7d', NOW)).toBe(false);
    expect(verifiedAnnouncementRecency({...payload, scope: 'all'}, '7d', NOW)).toBe(false);
    expect(verifiedAnnouncementRecency({...payload, announcements: [...payload.announcements, ...payload.announcements]}, '7d', NOW)).toBe(false);
    expect(verifiedAnnouncementRecency({...payload, announcements: [{...payload.announcements[0], publishedAt: '2026-10-26T23:59:59.999Z'}]}, '7d', NOW)).toBe(false);
    expect(verifiedAnnouncementRecency(payload, '7d', NOW + 360_000)).toBe(false);
  });
});
