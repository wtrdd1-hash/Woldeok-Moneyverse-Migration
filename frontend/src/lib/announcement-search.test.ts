import { describe, expect, it } from 'vitest';
import { announcementSearchMatches, normalizeAnnouncementSearch } from './announcement-search';

describe('public announcement title search', () => {
  it('normalizes literal Unicode query without broadening the scope', () => {
    expect(normalizeAnnouncementSearch('  공지  ')).toBe('공지');
    expect(normalizeAnnouncementSearch(undefined)).toBeNull();
    expect(announcementSearchMatches('월덕 공지사항', '공지')).toBe(true);
    expect(announcementSearchMatches('월덕 안내', '공지')).toBe(false);
  });
  it('rejects duplicate/unknown/invalid queries', () => {
    for (const input of [['공지', '소식'], 'a', '공지\n', '가'.repeat(41)]) {
      expect(() => normalizeAnnouncementSearch(input)).toThrow();
    }
  });
});

describe('announcement search response truth', () => {
  it('rejects an old backend that ignores the title filter', async () => {
    const { announcementSearchResponseMatches } = await import('./announcement-search');
    expect(announcementSearchResponseMatches({ announcements: [{ title: '다른 공지' }] }, '중요')).toBe(false);
    expect(announcementSearchResponseMatches({ announcements: [{ title: '중요 공지' }] }, '중요')).toBe(true);
    expect(announcementSearchResponseMatches({ announcements: Array.from({ length: 21 }, () => ({ title: '중요 공지' })) }, '중요')).toBe(false);
    expect(announcementSearchResponseMatches({ announcements: null }, '중요')).toBe(false);
  });
});
