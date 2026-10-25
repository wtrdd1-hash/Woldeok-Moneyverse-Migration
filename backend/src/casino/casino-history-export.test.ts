import { describe, expect, it, vi } from 'vitest';
import { parseCasinoHistoryLimit } from './casino.controller';
import { CasinoInputError, CasinoRepository } from './casino.repository';

const ACTOR = '00000000-0000-4000-8000-000000000001';

describe('bounded member casino history export', () => {
  it('defaults to the existing 20 plays and accepts the DB limit of 100', () => {
    expect(parseCasinoHistoryLimit(undefined)).toBe(20);
    expect(parseCasinoHistoryLimit('1')).toBe(1);
    expect(parseCasinoHistoryLimit('100')).toBe(100);
  });

  it.each(['0', '101', '-1', '1.5', '1e2', '01', '', ' 20 ', ['20'], {}])(
    'rejects malformed limit %s before database access',
    (input) => {
      expect(() => parseCasinoHistoryLimit(input)).toThrow();
    },
  );

  it('passes the owner and bounded limit to the existing SECURITY DEFINER function', async () => {
    const query = vi.fn(async () => ({ rows: [] }));
    const repository = new CasinoRepository({ query } as unknown as ConstructorParameters<typeof CasinoRepository>[0]);
    await repository.history(ACTOR, 100);
    expect(query).toHaveBeenCalledTimes(1);
    expect(query.mock.calls[0]?.[0]).toContain('member_casino_history($1::uuid, $2::integer)');
    expect(query.mock.calls[0]?.[1]).toEqual([ACTOR, 100]);
  });

  it('rejects a direct unbounded repository request before issuing SQL', async () => {
    const query = vi.fn(async () => ({ rows: [] }));
    const repository = new CasinoRepository({ query } as unknown as ConstructorParameters<typeof CasinoRepository>[0]);
    await expect(repository.history(ACTOR, 101)).rejects.toBeInstanceOf(CasinoInputError);
    expect(query).not.toHaveBeenCalled();
  });
});
