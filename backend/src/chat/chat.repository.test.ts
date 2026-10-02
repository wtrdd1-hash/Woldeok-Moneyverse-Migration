import { describe, expect, it, vi } from 'vitest';
import type { Queryable } from '../core/db';
import { PostgresChatRepository } from './chat.repository';

const actor = '11111111-1111-4111-8111-111111111111';

describe('PostgresChatRepository', () => {
  it('reads chat peer avatars from the authoritative member_profiles table', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });
    const repo = new PostgresChatRepository({ query } as unknown as Queryable);

    await repo.listConversations(actor, 50);

    const sql = String(query.mock.calls[0]?.[0] ?? '');
    expect(sql).toContain('LEFT JOIN public.member_profiles p');
    expect(sql).toContain('p.image_url AS peer_avatar_key');
    expect(sql).not.toContain('public.user_profiles');
  });
});
