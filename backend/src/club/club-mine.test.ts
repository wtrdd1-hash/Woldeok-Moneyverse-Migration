import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { ClubController } from './club.controller';
import { PostgresClubRepository } from './club.repository';
import { ClubService } from './club.service';

const actor = '11111111-1111-4111-8111-111111111111';
const foreign = '22222222-2222-4222-8222-222222222222';

describe('owner club membership pagination', () => {
  it('filters by session actor in SQL before pagination, never by client user id', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });
    const repo = new PostgresClubRepository({ query } as never);
    await repo.listMyClubs(actor, 25, 50);
    const [sql, params] = query.mock.calls[0] as [string, unknown[]];
    expect(sql).toMatch(/JOIN public\.club_members cm_actor/);
    expect(sql).toMatch(/cm_actor\.user_id = \$1::uuid/);
    expect(sql).toMatch(/ORDER BY c\.created_at DESC, c\.id DESC/);
    expect(params).toEqual([actor, 26, 50]);
    expect(sql).not.toContain(foreign);
    expect(sql).not.toMatch(/JOIN public\.users/); // App role has no direct users SELECT.
  });

  it('refuses a forged or missing actor', async () => {
    const query = vi.fn();
    const repo = new PostgresClubRepository({ query } as never);
    await expect(repo.listMyClubs('bad', 25, 0)).rejects.toThrow();
    expect(query).not.toHaveBeenCalled();
  });

  it('returns 25 items and next offset only when a 26th row exists', async () => {
    const rows = Array.from({ length: 26 }, (_, index) => ({ id: `${index}` }));
    const repo = { listMyClubs: vi.fn().mockResolvedValue(rows) } as unknown as PostgresClubRepository;
    const service = new ClubService(repo);
    const result = await service.listMyClubs(actor, 25);
    expect(result.clubs).toHaveLength(25);
    expect(result.has_more).toBe(true);
    expect(result.next_offset).toBe(50);
    expect(repo.listMyClubs).toHaveBeenCalledWith(actor, 25, 25);
  });

  it('rejects negative, fractional and excessive offsets at the controller boundary', async () => {
    const service = { listMyClubs: vi.fn() } as unknown as ClubService;
    const controller = new ClubController(service);
    const req = { session: { user_id: actor } } as never;
    for (const offset of ['-1', '1.5', '1000001', '1e3']) {
      await expect(controller.listMyClubs(req, offset)).rejects.toBeInstanceOf(BadRequestException);
    }
    expect(service.listMyClubs).not.toHaveBeenCalled();
  });
});
