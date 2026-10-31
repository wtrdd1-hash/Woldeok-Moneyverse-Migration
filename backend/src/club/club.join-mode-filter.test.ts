import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import type { RequestWithSession } from '../auth/session.context';
import type { Queryable } from '../core/db';
import { ClubController } from './club.controller';
import { ClubInputError, PostgresClubRepository } from './club.repository';
import type { ClubService } from './club.service';

const actor = '11111111-2222-4333-8444-555555555555';
const req = { session: { user_id: actor } } as unknown as RequestWithSession;

describe('club directory join mode filter', () => {
  it('passes only canonical modes to the service with actor scope', async () => {
    const service = { listClubs: vi.fn().mockResolvedValue([]) };
    const controller = new ClubController(service as unknown as ClubService);
    await controller.listClubs(req, 'alpha', '50', '0', 'public');
    expect(service.listClubs).toHaveBeenCalledWith(actor, 'alpha', 50, 0, 'public');
    await controller.listClubs(req);
    expect(service.listClubs).toHaveBeenLastCalledWith(actor, undefined, 50, 0, undefined);
  });

  it('rejects invalid, duplicate and array modes before querying', async () => {
    const service = { listClubs: vi.fn() };
    const controller = new ClubController(service as unknown as ClubService);
    for (const mode of ['PUBLIC', 'all', '', 'other', ['public', 'invite'], { joinMode: 'public' }]) {
      await expect(controller.listClubs(req, undefined, undefined, undefined, mode as string)).rejects.toThrow(BadRequestException);
    }
    expect(service.listClubs).not.toHaveBeenCalled();
  });

  it('binds join mode before SQL limit and never interpolates it', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });
    const repo = new PostgresClubRepository({ query } as unknown as Queryable);
    await repo.listClubs(actor, 'alpha', 5, 0, 'request');
    const [sql, params] = query.mock.lastCall!;
    expect(sql).toContain('c.join_mode = $5::text');
    expect(sql.indexOf('c.join_mode = $5::text')).toBeLessThan(sql.indexOf('LIMIT $3'));
    expect(params).toEqual([actor, 'alpha', 5, 0, 'request']);
    await expect(repo.listClubs(actor, undefined, 50, 0, 'not-a-mode')).rejects.toThrow(ClubInputError);
  });
});
