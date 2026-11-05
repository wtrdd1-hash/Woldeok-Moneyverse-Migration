import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { BlogVerifiedPublicController } from './blog-verified.controller';

const published = (topic: string, slug: string) => ({ topic, slug, status: 'PUBLISHED' });

function setup() {
  const list = vi.fn().mockResolvedValue([
    published('ECONOMY', '2026-10-28-kr-economy-0'),
    published('CODING', '2026-10-28-cn-coding-5'),
    published('COMPUTER', '2026-10-28-jp-computer-2'),
    { ...published('CODING', '2026-10-27-us-coding-4'), status: 'WITHDRAWN' },
  ]);
  return { controller: new BlogVerifiedPublicController({ list } as never), list };
}

describe('public verified editorial subject discovery', () => {
  it('filters only the bounded published SQL projection and reports its scope', async () => {
    const { controller, list } = setup();
    await expect(controller.list({ topic: 'CODING' })).resolves.toEqual({
      success: true, count: 1, scope: 'LATEST_150_PUBLISHED',
      posts: [published('CODING', '2026-10-28-cn-coding-5')],
    });
    expect(list).toHaveBeenCalledOnce();
  });

  it('preserves the legacy no-filter response while never surfacing withdrawn rows', async () => {
    const { controller } = setup();
    const result = await controller.list({});
    expect(result.count).toBe(3);
    expect(result.posts).toHaveLength(3);
    expect(result).not.toHaveProperty('scope');
  });

  it.each([
    { topic: ['CODING', 'COMPUTER'] }, { topic: '' }, { topic: 'coding' },
    { topic: 'INVALID' }, { topic: 'CODING', admin: 'true' },
  ])('rejects ambiguous or unsupported public filters: %j', async (query) => {
    const { controller, list } = setup();
    await expect(controller.list(query)).rejects.toBeInstanceOf(BadRequestException);
    expect(list).not.toHaveBeenCalled();
  });
});
