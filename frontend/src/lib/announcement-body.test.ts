import { describe, expect, it } from 'vitest';
import { parseAnnouncementFilters, verifiedAnnouncementBody } from './announcement-body';

describe('public announcement body search query and evidence', () => {
  it('rejects duplicate, unsupported and unsafe keys, composes sort', () => {
    expect(parseAnnouncementFilters(new URLSearchParams())).toEqual({ sort: 'pinned', body: null });
    expect(parseAnnouncementFilters(new URLSearchParams('body=%20server%20&sort=oldest'))).toEqual({ sort: 'oldest', body: 'server' });
    for (const query of ['body=x&body=y', 'body=', 'body=%3C', 'body=a%00b', 'body=x&secret=1', 'body=x&sort=oldest&sort=newest']) {
      expect(parseAnnouncementFilters(new URLSearchParams(query))).toBeNull();
    }
  });
  it('rejects stale upstream success and accepts verified published matching rows', () => {
    const one = { announcementId: '00000000-0000-4000-8000-000000000001', body: '서버 점검' };
    expect(verifiedAnnouncementBody({ announcements: [one] }, '서버')).toBe(true);
    expect(verifiedAnnouncementBody({ announcements: [one] }, 'SERVER')).toBe(false);
    expect(verifiedAnnouncementBody({ announcements: [{ ...one, body: null }] }, '서버')).toBe(false);
    expect(verifiedAnnouncementBody({ announcements: [one, one] }, '서버')).toBe(false);
    expect(verifiedAnnouncementBody({ announcements: Array(21).fill(one) }, '서버')).toBe(false);
    expect(verifiedAnnouncementBody({ announcements: [] }, '서버')).toBe(true);
  });
});
