import { describe, expect, it, vi } from 'vitest';
import { PATH_METADATA } from '@nestjs/common/constants';
import { ContentController } from './content.controller';
import { PostgresContentRepository } from './content.repository';

describe('public announcement DB boundary', () => {
  it('keeps the published feed on the public versioned route', () => {
    expect(Reflect.getMetadata(PATH_METADATA, ContentController.prototype.announcements)).toBe('announcements');
  });
  it('reads only through the published SECURITY DEFINER function, not direct tables', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });
    const repository = new PostgresContentRepository({ query } as never);
    await expect(repository.publishedAnnouncements()).resolves.toEqual([]);
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('FROM public.content_list_published_announcements($1)'),
      [20],
    );
    expect(query.mock.calls[0]?.[0]).not.toMatch(/FROM public\.announcements\b/i);
  });
});
