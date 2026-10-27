import { describe, expect, it, vi } from 'vitest';
import { EnterpriseRepository } from './enterprise.repository';

// Defense in depth: a direct repository caller must never reach unjournaled financial SQL.
describe('SOE dividend ledger hold', () => {
  it('refuses direct remittance without reading or writing the database', async () => {
    const query = vi.fn();
    const repository = new EnterpriseRepository({ query } as any);
    const outcomes = await Promise.allSettled(Array.from({ length: 100 }, () =>
      repository.distributeSoeDividends('admin-uuid'),
    ));
    expect(outcomes).toHaveLength(100);
    for (const outcome of outcomes) {
      expect(outcome.status).toBe('rejected');
      if (outcome.status === 'rejected') {
        expect(outcome.reason).toMatchObject({
          status: 503,
          response: expect.objectContaining({ code: 'SOE_DIVIDEND_LEDGER_UNAVAILABLE' }),
        });
      }
    }
    expect(query).not.toHaveBeenCalled();
  });
});
