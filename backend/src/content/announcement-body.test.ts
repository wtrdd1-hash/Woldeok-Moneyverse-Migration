import { describe, expect, it } from 'vitest';
import { parseAnnouncementBodyFilter, filterPublishedAnnouncementBodies } from './announcement-body';
import { ContentController } from './content.controller';
import { AppContentController } from './app-content.controller';

describe('bounded published announcement body search', () => {
  it('rejects unknown, duplicate, unsafe or empty body filters', () => {
    expect(parseAnnouncementBodyFilter({})).toBeNull();
    expect(parseAnnouncementBodyFilter({ body: '  경제  ' })).toBe('경제');
    for (const query of [
      { body: '' }, { body: ['a', 'b'] }, { body: ' '.repeat(3) },
      { body: '<script>' }, { body: 'a\u0000b' }, { body: 'a'.repeat(81) },
      { body: 'x', admin: '1' }, { body: 'x', sort: 'oldest' },
    ]) expect(() => parseAnnouncementBodyFilter(query)).toThrow();
  });
  it('filters only the already published bounded snapshot without mutating rows', () => {
    const rows = [
      { announcementId: '1', body: '경제 소식' },
      { announcementId: '2', body: 'SERVER STATUS' },
      { announcementId: '3', body: '서버 점검' },
    ];
    expect(filterPublishedAnnouncementBodies(rows, 'server')).toEqual([rows[1]]);
    expect(filterPublishedAnnouncementBodies(rows, '서버')).toEqual([rows[2]]);
    expect(filterPublishedAnnouncementBodies(rows, null)).toEqual(rows);
    expect(rows).toHaveLength(3);
  });
  for (const [surface, create] of [
    ['web', (service: unknown) => new ContentController(service as never)],
    ['Android', (service: unknown) => new AppContentController(service as never)],
  ] as const) {
    it(`${surface} forwards validated body to service`, async () => {
      const calls: unknown[] = [];
      const controller = create({ publicAnnouncements: async (filters: unknown) => { calls.push(filters); return []; } });
      await expect(controller.announcements({ body: '  server ' })).resolves.toEqual({ announcements: [] });
      expect(calls).toEqual([{ body: 'server' }]);
      await expect(controller.announcements({ body: ['a', 'b'] })).rejects.toThrow();
    });
  }
});
