import { describe, expect, it } from 'vitest';
import { parsePublicAnnouncements } from './announcement-feed';

const ID = '9adca849-7b28-4dd2-b2df-5f1b77a70001';
const row = {
  announcementId: ID, title: 'Service notice', body: 'Verified published notice',
  imageUrl: null, imageAltText: null, isPinned: true,
  publishedAt: '2026-10-31T10:00:00.000Z',
};

describe('published announcement feed evidence', () => {
  it('distinguishes a verified empty publication set from unavailable evidence', () => {
    expect(parsePublicAnnouncements({ announcements: [] })).toEqual({ announcements: [] });
    expect(parsePublicAnnouncements(null)).toBeNull();
    expect(parsePublicAnnouncements({ status: 'ok' })).toBeNull();
  });
  it('accepts a bounded, valid published feed', () => {
    expect(parsePublicAnnouncements({ announcements: [row] })).toEqual({ announcements: [row] });
  });
  it('does not forward unexpected internal or editorial fields', () => {
    expect(parsePublicAnnouncements({ announcements: [{ ...row, storageKey: '/srv/private/secret', draft: true }] }))
      .toEqual({ announcements: [row] });
  });
  it('rejects duplicate IDs, oversized feeds and malformed rows', () => {
    expect(parsePublicAnnouncements({ announcements: [row, row] })).toBeNull();
    expect(parsePublicAnnouncements({ announcements: Array.from({ length: 21 }, () => row) })).toBeNull();
    expect(parsePublicAnnouncements({ announcements: [{ ...row, isPinned: 'true' }] })).toBeNull();
    expect(parsePublicAnnouncements({ announcements: [{ ...row, title: '' }] })).toBeNull();
    expect(parsePublicAnnouncements({ announcements: [{ ...row, imageUrl: '/media/../secret' }] })).toBeNull();
  });
});
