import { describe, expect, it, vi } from 'vitest';
import { EnterpriseRepository } from './enterprise.repository';
import type { Queryable } from '../../core/db';

const ACTOR = 'd9cf27ca-9db4-47b8-8c28-19b3c88242f3';
const KEY = '32fd8174-fab3-480d-9ad5-47ce8f728ad3';

describe('EnterpriseRepository SOE dividend harvest boundary', () => {
  it('executes one authoritative database function with actor and retry key, never separate financial writes', async () => {
    const receipt = {
      total_dividends_collected: '108000',
      enterprises_processed: 3,
      treasury_balance_after: '25243090',
    };
    const query = vi.fn().mockResolvedValue({ rows: [{ receipt }] });
    const repo = new EnterpriseRepository({ query } as unknown as Queryable);

    await expect(repo.distributeSoeDividends(ACTOR, KEY)).resolves.toEqual(receipt);
    expect(query).toHaveBeenCalledTimes(1);
    expect(query).toHaveBeenCalledWith(
      expect.stringMatching(/SELECT\s+public\.admin_harvest_soe_dividends\(\$1::uuid,\s*\$2::uuid\)/),
      [ACTOR, KEY],
    );
    const sql = query.mock.calls.map(([statement]) => statement).join('\n');
    expect(sql).not.toMatch(/\b(?:INSERT|UPDATE|DELETE)\s+(?:INTO\s+|FROM\s+)?public\./i);
  });

  it('uses a stable hourly fallback key for legacy clients and rotates it the next hour', async () => {
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date('2026-10-24T08:05:00.000Z'));
      const receipt = {
        total_dividends_collected: '0',
        enterprises_processed: 0,
        treasury_balance_after: '1000',
      };
      const query = vi.fn().mockResolvedValue({ rows: [{ receipt }] });
      const repo = new EnterpriseRepository({ query } as unknown as Queryable);
      await repo.distributeSoeDividends(ACTOR);
      vi.setSystemTime(new Date('2026-10-24T08:55:00.000Z'));
      await repo.distributeSoeDividends(ACTOR);
      vi.setSystemTime(new Date('2026-10-24T09:01:00.000Z'));
      await repo.distributeSoeDividends(ACTOR);
      const first = query.mock.calls[0][1][1];
      const second = query.mock.calls[1][1][1];
      const third = query.mock.calls[2][1][1];
      expect(first).toMatch(/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/);
      expect(first).toBe(second);
      expect(third).not.toBe(first);
    } finally {
      vi.useRealTimers();
    }
  });

  it('rejects missing or invalid actor/key before any database query', async () => {
    const query = vi.fn();
    const repo = new EnterpriseRepository({ query } as unknown as Queryable);
    await expect(repo.distributeSoeDividends(undefined, KEY)).rejects.toThrow();
    await expect(repo.distributeSoeDividends(ACTOR, 'not-a-uuid')).rejects.toThrow();
    expect(query).not.toHaveBeenCalled();
  });

  it('rejects missing or malformed database receipts rather than fabricating a successful payout', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [{ receipt: { total_dividends_collected: '1.5' } }] });
    const repo = new EnterpriseRepository({ query } as unknown as Queryable);
    await expect(repo.distributeSoeDividends(ACTOR, KEY)).rejects.toThrow();
  });
});
