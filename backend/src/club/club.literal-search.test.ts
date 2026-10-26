import { describe, expect, it, vi } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import type { RequestWithSession } from '../auth/session.context';
import { ClubController } from './club.controller';
import { ClubService } from './club.service';
import type { Queryable } from '../core/db';
import { ClubInputError, PostgresClubRepository } from './club.repository';

const repository = () => {
  const query = vi.fn(async () => ({ rows: [] }));
  return { query, repo: new PostgresClubRepository({ query } as unknown as Queryable) };
};

describe('club discovery literal search and pagination', () => {
  it.each(['%', '_', '\\', 'Alpha_%\\', '한글'])('searches for literal text %s without SQL LIKE wildcards', async (search) => {
    const { repo, query } = repository();
    await repo.listClubs(undefined, `  ${search}  `);
    expect(query).toHaveBeenCalledOnce();
    const [sql, params] = query.mock.calls[0] as unknown as [string, unknown[]];
    expect(sql).not.toMatch(/\bILIKE\b/i);
    expect(sql).toMatch(/strpos\s*\(/i);
    expect(params[1]).toBe(search);
  });

  it('does not filter when search is whitespace-only', async () => {
    const { repo, query } = repository();
    await repo.listClubs(undefined, '  ');
    const [, params] = query.mock.calls[0] as unknown as [string, unknown[]];
    expect(params[1]).toBeNull();
  });

  it('rejects overlong search before a DB query', async () => {
    const { repo, query } = repository();
    await expect(repo.listClubs(undefined, 'x'.repeat(65))).rejects.toThrow(ClubInputError);
    expect(query).not.toHaveBeenCalled();
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY, -1, 1.5, Number.MAX_SAFE_INTEGER + 1])('rejects invalid offset %s', async (offset) => {
    const { repo, query } = repository();
    await expect(repo.listClubs(undefined, 'hello', 20, offset)).rejects.toThrow(ClubInputError);
    expect(query).not.toHaveBeenCalled();
  });

  it('keeps a stable unique tie-breaker across pages', async () => {
    const { repo, query } = repository();
    await repo.listClubs(undefined, 'a', 20, 10);
    const [sql, params] = query.mock.calls[0] as unknown as [string, unknown[]];
    expect(sql).toMatch(/ORDER BY[^;]*c\.id DESC/i);
    expect(params.slice(2)).toEqual([20, 10]);
  });
});


describe('club list HTTP query parsing', () => {
  const actor = { session: { user_id: '11111111-1111-1111-1111-111111111111' } } as RequestWithSession;
  it.each(['1junk', '1.5', '-1', 'Infinity', '9007199254740992'])('rejects malformed limit %s', async (limit) => {
    const listClubs = vi.fn(async () => []);
    const controller = new ClubController({ listClubs } as unknown as ClubService);
    await expect(controller.listClubs(actor, undefined, limit, '0')).rejects.toThrow(BadRequestException);
    expect(listClubs).not.toHaveBeenCalled();
  });
  it('accepts a canonical integer page and preserves response shape', async () => {
    const listClubs = vi.fn(async () => []);
    const controller = new ClubController({ listClubs } as unknown as ClubService);
    await expect(controller.listClubs(actor, '%', '10', '0')).resolves.toEqual({ clubs: [] });
    expect(listClubs).toHaveBeenCalledWith(actor.session?.user_id, '%', 10, 0);
  });
});


describe('club list API error mapping', () => {
  it('maps rejected repository search to HTTP 400', async () => {
    const repo = { listClubs: vi.fn(async () => { throw new ClubInputError('search too long'); }) };
    const service = new ClubService(repo as unknown as PostgresClubRepository);
    await expect(service.listClubs(undefined, 'x'.repeat(65))).rejects.toThrow(BadRequestException);
  });
});
