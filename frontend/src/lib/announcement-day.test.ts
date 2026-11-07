import { describe, expect, it } from 'vitest';
import { isVerifiedAnnouncementDayResponse, parseAnnouncementDay } from './announcement-day';

const valid = { publicationDay: '2026-09-18', announcements: [
  { announcementId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', publishedAt: '2026-09-17T15:00:00.000Z', title: 'Notice' },
] };

describe('verified announcement day on web and Android', () => {
  it('accepts valid calendar dates and rejects malformed/duplicated dates', () => {
    expect(parseAnnouncementDay('2026-09-18')).toBe('2026-09-18');
    expect(parseAnnouncementDay('2026-02-29')).toBeNull();
    expect(parseAnnouncementDay(['2026-09-18', '2026-09-19'])).toBeNull();
    expect(parseAnnouncementDay('2028-02-29')).toBe('2028-02-29');
  });

  it('requires an exact source echo and UTC/KST window proof', () => {
    expect(isVerifiedAnnouncementDayResponse(valid, '2026-09-18')).toBe(true);
    expect(isVerifiedAnnouncementDayResponse({ ...valid, publicationDay: undefined }, '2026-09-18')).toBe(false);
    expect(isVerifiedAnnouncementDayResponse({ ...valid, publicationDay: '2026-09-19' }, '2026-09-18')).toBe(false);
    expect(isVerifiedAnnouncementDayResponse({ ...valid, announcements: [{ ...valid.announcements[0], publishedAt: '2026-09-18T15:00:00.000Z' }] }, '2026-09-18')).toBe(false);
    expect(isVerifiedAnnouncementDayResponse({ ...valid, announcements: [valid.announcements[0], valid.announcements[0]] }, '2026-09-18')).toBe(false);
    expect(isVerifiedAnnouncementDayResponse({ ...valid, announcements: 'not rows' }, '2026-09-18')).toBe(false);
  });
});
