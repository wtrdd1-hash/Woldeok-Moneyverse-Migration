import { describe, expect, it, vi } from 'vitest';
import type { Queryable } from '../core/db';
import { PostgresClubRepository } from './club.repository';

const actor = '11111111-2222-4333-8444-555555555555';

describe('club directory SQL privilege boundary', () => {
  it('uses an owner-aware SECURITY DEFINER read instead of joining protected users directly', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });
    const repo = new PostgresClubRepository({ query } as unknown as Queryable);
    await repo.listClubs(actor, 'ALPHA', 50, 50);
    const [sql, params] = query.mock.calls[0] as [string, unknown[]];
    expect(sql).toContain('public.club_directory_page');
    expect(sql).not.toContain('JOIN public.users');
    expect(params).toEqual([actor, 'ALPHA', 50, 50]);
  });
});
