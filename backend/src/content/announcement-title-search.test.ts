import { describe, expect, it, vi } from 'vitest';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';
import { PostgresContentRepository } from './content.repository';

describe('public announcement title search over bounded published rows', () => {
  it('rejects duplicate, whitespace-only and oversized queries before reading', async () => {
    const publicAnnouncements = vi.fn().mockResolvedValue([]);
    const controller = new ContentController({ publicAnnouncements } as never);
    for (const q of [['a', 'b'], ' ', 'x'.repeat(81), '\u0000'] as unknown[]) {
      await expect(controller.announcements(q as string, '50')).rejects.toThrow();
    }
    for (const limit of ['0', '051', '51', '1.0', '10 ', ['10', '20']] as unknown[]) {
      await expect(controller.announcements('notice', limit as string)).rejects.toThrow();
    }
    expect(publicAnnouncements).not.toHaveBeenCalled();
  });
  it('keeps the default 20 and forwards literal search and a 50-row bound', async () => {
    const publicAnnouncements = vi.fn().mockResolvedValue([]);
    const controller = new ContentController({ publicAnnouncements } as never);
    await controller.announcements();
    expect(publicAnnouncements).toHaveBeenCalledWith({ limit: 20 });
    await controller.announcements('  NOTICE  ', '50');
    expect(publicAnnouncements).toHaveBeenCalledWith({ limit: 50, q: 'NOTICE' });
  });
  it('uses the published-only PostgreSQL function and binds literal q as data', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });
    const repo = new PostgresContentRepository({ query } as never);
    await repo.publishedAnnouncements({ limit: 50, q: '%_quoted' });
    const [sql, params] = query.mock.calls[0] as [string, unknown[]];
    expect(sql).toContain('public.content_list_published_announcements($1)');
    expect(sql).toContain('strpos(');
    expect(sql).not.toContain('%_quoted');
    expect(params).toEqual([50, '%_quoted']);
  });
  it('passes the search to repository without inventing unpublished data', async () => {
    const publishedAnnouncements = vi.fn().mockResolvedValue([]);
    const service = new ContentService(Object.assign(new PostgresContentRepository({ query: vi.fn() } as never), { publishedAnnouncements }) as never);
    await expect(service.publicAnnouncements({ limit: 50, q: '공지' })).resolves.toEqual([]);
    expect(publishedAnnouncements).toHaveBeenCalledWith({ limit: 50, q: '공지' });
  });
});
