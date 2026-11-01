import { describe, expect, it } from 'vitest';
import { announcementFeedPath, isVerifiedPinnedAnnouncementResponse } from './announcement-pinned';

describe('public pinned announcement navigation', () => {
  it('preserves the static public feed and selects a pinned-only backend read', () => {
    expect(announcementFeedPath(false)).toBe('/api/v1/announcements');
    expect(announcementFeedPath(true)).toBe('/api/v1/announcements?pinnedOnly=1');
  });
  it('never presents unfiltered or malformed HTTP 200 data as pinned results', () => {
    expect(isVerifiedPinnedAnnouncementResponse({ announcements: [] })).toBe(true);
    expect(isVerifiedPinnedAnnouncementResponse({ announcements: [{ announcementId: 'id', isPinned: true }] })).toBe(true);
    expect(isVerifiedPinnedAnnouncementResponse({ announcements: [{ announcementId: 'id', isPinned: false }] })).toBe(false);
    expect(isVerifiedPinnedAnnouncementResponse({ announcements: new Array(21).fill({ announcementId: 'id', isPinned: true }) })).toBe(false);
    expect(isVerifiedPinnedAnnouncementResponse(null)).toBe(false);
  });
});
