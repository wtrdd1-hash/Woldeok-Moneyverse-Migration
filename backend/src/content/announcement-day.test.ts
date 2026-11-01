import { describe, expect, it, vi } from 'vitest';
import { seoulAnnouncementDay } from './announcement-day';
import { PostgresContentRepository } from './content.repository';
import { ContentService } from './content.service';
import { ContentController } from './content.controller';
import { AppContentController } from './app-content.controller';

describe('public announcement publication day', () => {
  it('uses a strict Seoul midnight-to-midnight half-open UTC window', () => {
    expect(seoulAnnouncementDay('2026-09-18')).toEqual({
      day: '2026-09-18',
      fromUtc: '2026-09-17T15:00:00.000Z',
      toUtc: '2026-09-18T15:00:00.000Z',
    });
    expect(seoulAnnouncementDay('2028-02-29')?.day).toBe('2028-02-29');
    expect(seoulAnnouncementDay(undefined)).toBeNull();
  });

  it.each(['2026-02-29', '2026-13-01', '2026-09-31', '2026-9-18', '1999-12-31', '2100-01-01', '', '2026-09-18 ', ['2026-09-18', '2026-09-19']])(
    'rejects invalid or duplicated day %j',
    (day) => expect(() => seoulAnnouncementDay(day)).toThrow(),
  );

  it('uses only the authorized latest-20 SQL function with bound timestamp predicates', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });
    const repository = new PostgresContentRepository({ query } as never);
    const range = seoulAnnouncementDay('2026-09-18')!;
    await repository.publishedAnnouncements({ limit: 20, dayRange: range });
    const [sql, params] = query.mock.calls[0]!;
    expect(sql).toContain('public.content_list_published_announcements($1)');
    expect(sql).toContain('published_at >= $2::timestamptz');
    expect(sql).toContain('published_at < $3::timestamptz');
    expect(sql).not.toMatch(/FROM\s+public\.announcements\b/i);
    expect(params).toEqual([20, range.fromUtc, range.toUtc]);
  });

  it('rejects invalid day before touching the repository', async () => {
    const repository = Object.fromEntries([
      'publishedAnnouncements', 'publishedPhotos', 'isPublicStorageKey', 'publicStatus',
      'saveAnnouncement', 'setAnnouncementImage', 'setAnnouncementPublication',
      'savePhoto', 'setPhotoPublication', 'adminListPendingPhotos', 'adminListAllPhotos',
      'adminDeletePhoto', 'adminRejectPhoto', 'adminListAllAnnouncements',
      'adminDeleteAnnouncement', 'adminUpdateAnnouncement',
    ].map((method) => [method, vi.fn().mockResolvedValue([])]));
    const service = new ContentService(repository as never);
    await expect(service.publicAnnouncements({ day: ['2026-09-18', '2026-09-19'] })).rejects.toThrow();
    expect(repository.publishedAnnouncements).not.toHaveBeenCalled();
    await expect(service.publicAnnouncements({ day: '2026-09-18' })).resolves.toEqual([]);
    expect(repository.publishedAnnouncements).toHaveBeenCalledWith({
      limit: 20, dayRange: seoulAnnouncementDay('2026-09-18'),
    });
  });

  it('returns an exact day echo for both public web and Android endpoints', async () => {
    const publicAnnouncements = vi.fn().mockResolvedValue([]);
    const service = { publicAnnouncements } as never;
    const web = new ContentController(service);
    const app = new AppContentController(service);
    await expect(web.announcements({ day: '2026-09-18' })).resolves.toEqual({
      announcements: [], publicationDay: '2026-09-18',
    });
    await expect(app.announcements({ day: '2026-09-18' })).resolves.toEqual({
      announcements: [], publicationDay: '2026-09-18',
    });
  });
});
