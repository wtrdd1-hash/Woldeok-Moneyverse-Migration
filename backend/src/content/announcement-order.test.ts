import { describe, expect, it } from 'vitest';
import { parseAnnouncementOrder, orderPublishedAnnouncements } from './announcement-order';

const a = { announcementId: '00000000-0000-4000-8000-000000000001', publishedAt: '2026-09-10T00:00:00.000Z', isPinned: true };
const b = { announcementId: '00000000-0000-4000-8000-000000000002', publishedAt: '2026-10-10T00:00:00.000Z', isPinned: false };
const c = { announcementId: '00000000-0000-4000-8000-000000000003', publishedAt: '2026-10-10T00:00:00.000Z', isPinned: false };

describe('public announcement snapshot order', () => {
  it('preserves the database pinned-first order when no sort was requested', () => {
    expect(parseAnnouncementOrder({})).toBe('pinned');
    expect(orderPublishedAnnouncements([a, c, b], 'pinned')).toEqual([a, c, b]);
  });
  it('sorts by publication time and stable id without mutating the source', () => {
    const original = [a, c, b];
    expect(orderPublishedAnnouncements(original, 'newest')).toEqual([c, b, a]);
    expect(orderPublishedAnnouncements(original, 'oldest')).toEqual([a, b, c]);
    expect(original).toEqual([a, c, b]);
  });
  it('rejects duplicate, unknown, blank and unexpected query parameters', () => {
    for (const input of [{ sort: ['oldest', 'newest'] }, { sort: 'bad' }, { sort: '' }, { sort: 'oldest', admin: '1' }, { sort: null }]) {
      expect(() => parseAnnouncementOrder(input)).toThrow();
    }
    expect(parseAnnouncementOrder({ sort: 'pinned' })).toBe('pinned');
    expect(parseAnnouncementOrder({ sort: 'newest' })).toBe('newest');
    expect(parseAnnouncementOrder({ sort: 'oldest' })).toBe('oldest');
  });
});

import { ContentController } from './content.controller';
import { AppContentController } from './app-content.controller';

describe('both published announcement HTTP surfaces', () => {
  for (const [name, factory] of [
    ['web', (service: unknown) => new ContentController(service as never)],
    ['Android', (service: unknown) => new AppContentController(service as never)],
  ] as const) {
    it(`${name} passes verified sort to the shared content service`, async () => {
      const publicAnnouncements = async (options: unknown) => { expect(options).toEqual({ sort: 'oldest' }); return [a]; };
      const controller = factory({ publicAnnouncements });
      await expect(controller.announcements({ sort: 'oldest' })).resolves.toEqual({ announcements: [a] });
      await expect(controller.announcements({ sort: ['oldest', 'newest'] })).rejects.toThrow();
      await expect(controller.announcements({ extra: 'secret' })).rejects.toThrow();
    });
  }
});
