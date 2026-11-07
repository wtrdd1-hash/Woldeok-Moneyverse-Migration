import { afterEach, describe, expect, it, vi } from 'vitest';
import { AppContentController } from './app-content.controller';
import { parseAnnouncementRecency, announcementRecencyWindow } from './announcement-recency';

const AS_OF = new Date('2026-11-03T00:00:00.000Z');

afterEach(() => vi.useRealTimers());

describe('published announcement recency', () => {
  it('accepts only the supported windows and absent filter', () => {
    expect(parseAnnouncementRecency(undefined)).toBeNull();
    expect(parseAnnouncementRecency('7d')).toBe('7d');
    expect(parseAnnouncementRecency('30d')).toBe('30d');
    for (const invalid of ['', 'all', '1d', '7D', ['7d', '30d'], 7, null]) {
      expect(() => parseAnnouncementRecency(invalid)).toThrow();
    }
  });
  it('includes the inclusive boundary and excludes future publication dates', () => {
    expect(announcementRecencyWindow('7d', '2026-10-27T00:00:00.000Z', AS_OF)).toBe(true);
    expect(announcementRecencyWindow('7d', '2026-10-26T23:59:59.999Z', AS_OF)).toBe(false);
    expect(announcementRecencyWindow('7d', '2026-11-03T00:00:00.001Z', AS_OF)).toBe(false);
    expect(announcementRecencyWindow('30d', '2026-10-10T00:00:00.000Z', AS_OF)).toBe(true);
    expect(() => announcementRecencyWindow('7d', null, AS_OF)).toThrow();
  });
});


describe('Android app content recency', () => {
  it('requires exact filters and sends the verified server snapshot', async () => {
    const publicAnnouncements = vi.fn().mockResolvedValue([]);
    const controller = new AppContentController({publicAnnouncements} as never);
    await expect(controller.announcements(['7d', '7d'])).rejects.toThrow();
    const result = await controller.announcements('30d');
    expect(result).toMatchObject({recentApplied: '30d', scope: 'latest-20-published', announcements: []});
    expect(publicAnnouncements).toHaveBeenCalledWith({recent: '30d', asOf: expect.any(Date)});
  });
});
