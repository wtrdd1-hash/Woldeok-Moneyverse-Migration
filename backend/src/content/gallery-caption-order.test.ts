import { describe, expect, it, vi } from 'vitest';
import type { Queryable } from '../core/db';
import { PostgresContentRepository } from './content.repository';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';

const photo = {
  photo_id: '2e090c86-3cd8-47ca-b7db-4be7d7b8daad',
  image_url: '/media/7eede72c-432b-4a45-8ba6-420dd24350c7.jpg',
  alt_text: '바다',
  published_at: new Date('2026-11-01T00:00:00.000Z'),
};

describe('P1 gallery caption ordering', () => {
  it('orders only the bounded approved photo function rows, without direct table reads', async () => {
    const query = vi.fn(async () => ({ rows: [photo] }));
    const repository = new PostgresContentRepository({ query } as unknown as Queryable);
    await expect(repository.publishedPhotos({ sort: 'caption' })).resolves.toEqual([photo]);
    const [sql, args] = query.mock.calls[0] as unknown as [string, unknown[]];
    expect(sql).toContain('FROM public.content_list_published_photos($1)');
    expect(sql).toMatch(/ORDER BY alt_text COLLATE "C" ASC, photo_id ASC/);
    expect(sql).not.toMatch(/FROM public\.photos\b/);
    expect(args).toEqual([24]);
  });

  it('preserves the existing default query without sort', async () => {
    const query = vi.fn(async () => ({ rows: [] }));
    const repository = new PostgresContentRepository({ query } as unknown as Queryable);
    await repository.publishedPhotos();
    expect(String(query.mock.calls[0]?.[0])).not.toContain('ORDER BY alt_text');
  });

  it('passes validated sort through controller, service and repository', async () => {
    const query = vi.fn(async () => ({ rows: [photo] }));
    const service = new ContentService(new PostgresContentRepository({ query } as unknown as Queryable));
    const controller = new ContentController(service);
    await expect(controller.photos({ sort: 'caption' })).resolves.toMatchObject({
      photos: [expect.objectContaining({ altText: '바다' })],
    });
    expect(String(query.mock.calls[0]?.[0])).toContain('ORDER BY alt_text COLLATE "C"');
  });

  it.each([{ sort: ['caption', 'caption'] }, { sort: 'oldest' }, { arbitrary: '1' }])(
    'rejects malformed or unrecognized query %j without reading photos', async (query) => {
      const publicPhotos = vi.fn(async () => []);
      const controller = new ContentController({ publicPhotos } as never);
      await expect(controller.photos(query)).rejects.toMatchObject({ status: 400 });
      expect(publicPhotos).not.toHaveBeenCalled();
    },
  );
});
