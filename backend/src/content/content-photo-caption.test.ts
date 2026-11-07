import { describe, expect, it, vi } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { ContentController } from './content.controller';
import { AppContentController } from './app-content.controller';
import { ContentService } from './content.service';
import { parsePhotoCaptionQuery, PostgresContentRepository } from './content.repository';

describe('published photo caption discovery', () => {
  it('rejects malformed and duplicate filters without silently widening scope', () => {
    expect(parsePhotoCaptionQuery({})).toBeNull();
    expect(parsePhotoCaptionQuery({ q: ' 제주 ' })).toBe('제주');
    for (const query of [
      { q: ' ' }, { q: 'a' }, { q: 'x'.repeat(61) },
      { q: ['제주', '제주'] }, { q: '제주', limit: '100' },
      { q: '제\u0000주' }, { sort: 'recent' },
    ]) expect(() => parsePhotoCaptionQuery(query)).toThrow();
  });

  it('searches only the bounded SECURITY DEFINER published result with bound literal query', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });
    const repository = new PostgresContentRepository({ query } as never);
    await repository.publishedPhotos({ caption: '100%_ 제주' });
    const [sql, args] = query.mock.calls[0]!;
    expect(sql).toContain('public.content_list_published_photos($1)');
    expect(sql).toContain('strpos(lower(alt_text), lower($2)) > 0');
    expect(sql).not.toContain('public.photos AS');
    expect(args).toEqual([24, '100%_ 제주']);
  });

  it('validates public and Android controllers and propagates a bounded query', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });
    const service = new ContentService(new PostgresContentRepository({ query } as never));
    const publicController = new ContentController(service);
    const appController = new AppContentController(service);
    await expect(publicController.photos({ q: ['제주', '제주'] })).rejects.toBeInstanceOf(BadRequestException);
    await expect(appController.photos({ q: 'a' })).rejects.toBeInstanceOf(BadRequestException);
    await expect(publicController.photos({ q: '제주' })).resolves.toEqual({ photos: [] });
    await expect(appController.photos({ q: '제주' })).resolves.toEqual({ photos: [] });
    expect(query).toHaveBeenLastCalledWith(expect.stringContaining('content_list_published_photos'), [24, '제주']);
  });
});
