import { describe, expect, it, vi } from 'vitest';
import { parseAnnouncementPinnedQuery, PostgresContentRepository } from './content.repository';
import { ContentService } from './content.service';
import { ContentController } from './content.controller';
import { AppContentController } from './app-content.controller';
import { BadRequestException } from '@nestjs/common';

describe('published pinned announcement filter', () => {
  it('accepts only the explicit pinnedOnly=1 public filter', () => {
    expect(parseAnnouncementPinnedQuery({})).toBe(false);
    expect(parseAnnouncementPinnedQuery({ pinnedOnly: '1' })).toBe(true);
    for (const query of [
      { pinnedOnly: '0' }, { pinnedOnly: 'true' }, { pinnedOnly: ['1', '1'] },
      { pinnedOnly: '1', limit: '100' }, { pinnedOnly: '' },
    ]) expect(() => parseAnnouncementPinnedQuery(query)).toThrow();
  });

  it('filters inside the database function result, not by granting direct table access', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });
    const repository = new PostgresContentRepository({ query } as never);
    await repository.publishedAnnouncements({ pinnedOnly: true });
    expect(query).toHaveBeenCalledOnce();
    const [sql, params] = query.mock.calls[0]!;
    expect(sql).toContain('public.content_list_published_announcements($1)');
    expect(sql).toContain('is_pinned IS TRUE');
    expect(params).toEqual([20, true]);
  });

  it('rejects duplicate pinned query on both public and app API controllers', async () => {
    const repository = new PostgresContentRepository({ query: vi.fn().mockResolvedValue({ rows: [] }) } as never);
    const service = new ContentService(repository);
    const publicController = new ContentController(service);
    const appController = new AppContentController(service);
    await expect(publicController.announcements({ pinnedOnly: ['1', '1'] }))
      .rejects.toBeInstanceOf(BadRequestException);
    await expect(appController.announcements({ pinnedOnly: ['1', '1'] }))
      .rejects.toBeInstanceOf(BadRequestException);
    await expect(publicController.announcements({ pinnedOnly: '1' }))
      .resolves.toEqual({ announcements: [] });
  });

  it('passes the pinned filter through the service while preserving the default', async () => {
    const publishedAnnouncements = vi.fn().mockResolvedValue([]);
    const repository = new PostgresContentRepository({ query: vi.fn() } as never);
    repository.publishedAnnouncements = publishedAnnouncements;
    const service = new ContentService(repository);
    await service.publicAnnouncements({ pinnedOnly: true });
    expect(publishedAnnouncements).toHaveBeenCalledWith({ limit: 20, pinnedOnly: true });
    await service.publicAnnouncements();
    expect(publishedAnnouncements).toHaveBeenLastCalledWith({ limit: 20, pinnedOnly: false });
  });
});
