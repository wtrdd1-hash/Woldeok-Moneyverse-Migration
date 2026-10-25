import { describe, expect, it, vi } from 'vitest';
import type { Queryable } from '../core/db';
import { ProgressionRepository } from './progression.repository';

const ACTOR = '11111111-1111-4111-8111-111111111111';
const loan = (i: number) => ({
  loan_id: '22222222-2222-4222-8222-' + String(i).padStart(12, '0'),
  principal_amount: '9007199254740993',
  interest_amount: '999',
  outstanding_amount: '9007199254741992',
  status: 'active',
  issued_at: new Date('2026-10-01T00:00:00Z'),
  repaid_at: null,
});

describe('owner-only bounded virtual loan statement read model', () => {
  it('reads bank_my_loans for the server-derived actor with LIMIT 20, never tables', async () => {
    const query = vi.fn(async () => ({ rows: [loan(1)] }));
    const repository = new ProgressionRepository({ query } as unknown as Queryable);
    const result = await repository.loanStatement(ACTOR);
    expect(result).toMatchObject({ scope: 'recent_20_only' });
    expect(result.loans).toHaveLength(1);
    expect(result.loans[0]?.principal_amount).toBe('9007199254740993');
    expect(query).toHaveBeenCalledOnce();
    expect(query.mock.calls[0]![0]).toContain('public.bank_my_loans($1)');
    expect(query.mock.calls[0]![0]).toContain('LIMIT 20');
    expect(query.mock.calls[0]![1]).toEqual([ACTOR]);
  });

  it('limits to 20 without claiming complete history or measured truncation', async () => {
    const query = vi.fn(async () => ({ rows: Array.from({ length: 101 }, (_, i) => loan(i)) }));
    const result = await new ProgressionRepository({ query } as unknown as Queryable).loanStatement(ACTOR);
    expect(result.loans).toHaveLength(20);
    expect(result.scope).toBe('recent_20_only');
    expect('truncated' in result).toBe(false);
  });

  it('refuses a caller-supplied invalid actor before any SQL', async () => {
    const query = vi.fn();
    await expect(new ProgressionRepository({ query } as unknown as Queryable).loanStatement('other')).rejects.toThrow('actor must be a UUID');
    expect(query).not.toHaveBeenCalled();
  });
});
