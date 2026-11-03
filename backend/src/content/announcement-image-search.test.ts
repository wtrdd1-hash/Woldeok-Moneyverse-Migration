import { describe, expect, it, vi } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { parseAnnouncementImageSearch } from './announcement-image-search';
import { PostgresContentRepository } from './content.repository';
import { ContentService } from './content.service';
import { ContentController } from './content.controller';
import { AppContentController } from './app-content.controller';

describe('published announcement image description search', () => {
  it('accepts only one safe 2-80 code-point literal query', () => {
    expect(parseAnnouncementImageSearch({ imageAlt: '  제주 %_ 풍경  ' })).toBe('제주 %_ 풍경');
    expect(parseAnnouncementImageSearch({})).toBeUndefined();
    for (const input of [
      { imageAlt: '' }, { imageAlt: 'a' }, { imageAlt: 'x'.repeat(81) },
      { imageAlt: ['one', 'two'] }, { imageAlt: 'a\nb' },
      { imageAlt: '<img>' }, { imageAlt: 'valid', unknown: 'ignored' },
    ]) expect(() => parseAnnouncementImageSearch(input)).toThrow(BadRequestException);
  });

  it('filters within the 20 most recent published database rows with literal substring matching', async () => {
    const pool = { query: vi.fn().mockResolvedValue({ rows: [] }) };
    const repository = new PostgresContentRepository(pool as never);
    await expect(repository.publishedAnnouncements({ imageAlt: '  제주 %_ ' })).resolves.toEqual([]);
    const [sql, values] = pool.query.mock.calls[0]!;
    expect(sql).toContain('public.content_list_published_announcements($1)');
    expect(sql).toContain('strpos(lower(image_alt_text), lower($2::text)) > 0');
    expect(sql).toContain('image_url IS NOT NULL');
    expect(values).toEqual([20, '제주 %_']);
  });

  it('passes a normalized search from the service to the published-only repository', async () => {
    const publishedAnnouncements = vi.fn().mockResolvedValue([]);
    const repository = Object.assign(Object.create(PostgresContentRepository.prototype), {
      publishedAnnouncements,
    }) as PostgresContentRepository;
    const service = new ContentService(repository);
    await expect(service.publicAnnouncements({ imageAlt: '  제주 %_  ' })).resolves.toEqual([]);
    expect(publishedAnnouncements).toHaveBeenCalledWith({ limit: 20, imageAlt: '제주 %_' });
  });

  it('passes validated image search to both public and Android content controllers', async () => {
    const publicAnnouncements = vi.fn().mockResolvedValue([]);
    const regular = new ContentController({ publicAnnouncements } as never);
    const app = new AppContentController({ publicAnnouncements } as never);
    await expect(regular.announcements({ imageAlt: '  바다  ' })).resolves.toEqual({ announcements: [] });
    await expect(app.announcements({ imageAlt: '  바다  ' })).resolves.toEqual({ announcements: [] });
    expect(publicAnnouncements).toHaveBeenNthCalledWith(1, { imageAlt: '바다' });
    expect(publicAnnouncements).toHaveBeenNthCalledWith(2, { imageAlt: '바다' });
    await expect(regular.announcements({ imageAlt: ['bad', 'bad'] })).rejects.toThrow(BadRequestException);
    expect(publicAnnouncements).toHaveBeenCalledTimes(2);
  });
});
