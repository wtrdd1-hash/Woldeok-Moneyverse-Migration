import { describe, expect, it } from 'vitest';
import { parseAnnouncementPinned } from './announcement-pinned';

describe('public pinned announcement query', () => {
  it('defaults to the public list and enables only pinnedOnly=1', () => {
    expect(parseAnnouncementPinned({})).toBe(false);
    expect(parseAnnouncementPinned({ pinnedOnly: '1' })).toBe(true);
    expect(parseAnnouncementPinned({ pinnedOnly: '0' })).toBe(null);
    expect(parseAnnouncementPinned({ pinnedOnly: ['1', '1'] })).toBe(null);
    expect(parseAnnouncementPinned({ extra: '1' })).toBe(null);
  });
});
