import { describe, expect, it, vi } from 'vitest';
import { ClubService } from './club.service';
import { PostgresClubRepository } from './club.repository';
import type { Queryable } from '../core/db';

const actor = '11111111-1111-4111-8111-111111111111';
const club = '22222222-2222-4222-8222-222222222222';
const project = '33333333-3333-4333-8333-333333333333';
const key = '44444444-4444-4444-8444-444444444444';

describe('P0 club project funding ledger hold', () => {
  it('refuses a valid contribution as HTTP 503 with stable code, without calling the repository', async () => {
    const contributeToProject = vi.fn().mockResolvedValue({ contribution_id: key, accepted_amount: '1000' });
    const service = new ClubService({ contributeToProject } as unknown as PostgresClubRepository);
    await expect(service.contributeToProject(actor, club, project, 1000, key)).rejects.toMatchObject({
      status: 503,
      response: { code: 'CLUB_PROJECT_LEDGER_UNAVAILABLE' },
    });
    expect(contributeToProject).not.toHaveBeenCalled();
  });

  it('refuses repeated and concurrent retries before any ledger or balance query', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [{ contribution_id: key, accepted_amount: '1000' }] });
    const repo = new PostgresClubRepository({ query } as unknown as Queryable);
    const outcomes = await Promise.allSettled(Array.from({ length: 20 }, () =>
      repo.contributeToProject(actor, club, project, 1000, key),
    ));
    expect(outcomes).toHaveLength(20);
    expect(outcomes.every((result) => result.status === 'rejected')).toBe(true);
    expect(query).not.toHaveBeenCalled();
  });
});
