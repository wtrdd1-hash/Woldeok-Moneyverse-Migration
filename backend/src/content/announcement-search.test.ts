import { describe, expect, it, vi } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { parseAnnouncementSearch } from './announcement-search';
import { ContentController } from './content.controller';
import { AppContentController } from './app-content.controller';

describe('published announcement title search request boundary', () => {
  it('normalizes a Korean title query and accepts no query by default', () => {
    expect(parseAnnouncementSearch({ q: '  공지  ' })).toBe('공지');
    expect(parseAnnouncementSearch({})).toBeNull();
  });
  it('rejects duplicate, control, too short and unknown query parameters', () => {
    for (const query of [{ q: ['공지', '알림'] }, { q: 'a' }, { q: '공지\n' }, { q: '공지', owner: 'other' }, { q: '가'.repeat(41) }]) {
      expect(() => parseAnnouncementSearch(query)).toThrow(BadRequestException);
    }
  });
  it('applies the same query to public web and Android content controllers', async () => {
    const publicAnnouncements = vi.fn().mockResolvedValue([]);
    const web = new ContentController({ publicAnnouncements } as never);
    const app = new AppContentController({ publicAnnouncements } as never);
    await expect(web.announcements({ q: '  공지  ' })).resolves.toEqual({ announcements: [] });
    await expect(app.announcements({ q: '  공지  ' })).resolves.toEqual({ announcements: [] });
    expect(publicAnnouncements).toHaveBeenNthCalledWith(1, { q: '공지' });
    expect(publicAnnouncements).toHaveBeenNthCalledWith(2, { q: '공지' });
  });
});
