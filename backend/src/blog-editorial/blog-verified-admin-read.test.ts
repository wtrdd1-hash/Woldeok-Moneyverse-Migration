import { describe, expect, it, vi } from 'vitest';
import type { Queryable } from '../core/db';
import type { RequestWithSession } from '../auth/session.context';
import { BlogVerifiedRepository } from './blog-verified.repository';
import { BlogVerifiedAdminController } from './blog-verified-admin.controller';

const ACTOR = '11111111-1111-4111-8111-111111111111';

describe('admin verified blog list remains role-scoped after SQL 298', () => {
  it('calls only the actor-scoped SECURITY DEFINER read, never the revoked table', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });
    const repo = new BlogVerifiedRepository({ query } as unknown as Queryable);
    await repo.listForAdmin(ACTOR);
    expect(query).toHaveBeenCalledTimes(1);
    expect(query.mock.calls[0]?.[0]).toMatch(/FROM public\.blog_verified_admin_list\(\$1::uuid\)/);
    expect(query.mock.calls[0]?.[1]).toEqual([ACTOR]);
    expect(query.mock.calls[0]?.[0]).not.toMatch(/FROM public\.blog_verified_articles\b/);
  });

  it('passes the authenticated session actor, not caller-supplied request input', async () => {
    const listForAdmin = vi.fn().mockResolvedValue([{ slug: 'verified-article' }]);
    const controller = new BlogVerifiedAdminController({ listForAdmin } as never);
    const request = { session: { user_id: ACTOR } } as RequestWithSession;
    await expect(controller.list(request)).resolves.toEqual({ posts: [{ slug: 'verified-article' }] });
    expect(listForAdmin).toHaveBeenCalledExactlyOnceWith(ACTOR);
  });
});
