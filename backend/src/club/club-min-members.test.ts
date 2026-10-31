import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import type { RequestWithSession } from '../auth/session.context';
import type { Queryable } from '../core/db';
import { ClubController } from './club.controller';
import { PostgresClubRepository } from './club.repository';
import type { ClubService } from './club.service';

const actor = '11111111-2222-4333-8444-555555555555';
const request = { session: { user_id: actor } } as unknown as RequestWithSession;

describe('verified club discovery minimum-members filter', () => {
  it('validates and binds a canonical minimum before querying', async () => {
    const listClubs = vi.fn().mockResolvedValue([]);
    const controller = new ClubController({ listClubs } as unknown as ClubService);
    await controller.listClubs(request, 'Alpha', '25', '0', '12');
    expect(listClubs).toHaveBeenCalledWith(actor, 'Alpha', 25, 0, 12);
    for (const value of ['-1', '1.5', '01', '100001', 'NaN', '', ['1', '2']]) {
      listClubs.mockClear();
      await expect(controller.listClubs(request, undefined, undefined, undefined, value as string)).rejects.toThrow(BadRequestException);
      expect(listClubs).not.toHaveBeenCalled();
    }
  });

  it('uses a scoped SECURITY DEFINER read instead of direct private-table joins', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });
    const repo = new PostgresClubRepository({ query } as unknown as Queryable);
    await repo.listClubs(actor, 'Alpha', 25, 0, 12);
    const [sql, params] = query.mock.calls[0] as [string, unknown[]];
    expect(sql).toMatch(/public\.club_directory_list\s*\(/);
    expect(sql).not.toMatch(/JOIN\s+public\.users/i);
    expect(params).toEqual([actor, 'Alpha', 12, 25, 0]);
  });
});
