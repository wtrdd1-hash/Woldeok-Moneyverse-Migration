import { describe, expect, it, vi } from 'vitest';
import { TreasuryRepository } from './treasury.repository';
import type { Queryable } from '../../core/db';

describe('v1651 read-only fiscal epoch ACL regression', () => {
  it.each(['getRevenue', 'getExpenditure'] as const)(
    '%s uses permitted scoped proof and never directly SELECTs private epoch data', async (operation) => {
      const query = vi.fn(async (statement: string) => {
        if (/FROM\s+public\.treasury_fiscal_epochs/i.test(statement)) {
          throw Object.assign(new Error('permission denied for table treasury_fiscal_epochs'), { code: '42501' });
        }
        if (/FROM\s+public\.system_treasury_ledger/i.test(statement)) {
          if (!statement.includes('SELECT epoch_opened_at FROM public.treasury_fiscal_proof_read()')) {
            throw Object.assign(new Error('missing authorized epoch boundary'), { code: '42501' });
          }
          return { rows: [] };
        }
        return { rows: [] };
      });
      const repository = new TreasuryRepository({ query } as unknown as Queryable);
      const result = await repository[operation]();
      expect(result.total_24h_wld).toBe('0');
      expect(result.total_7d_wld).toBe('0');
      expect(result.total_30d_wld).toBe('0');
      expect(query).toHaveBeenCalled();
    },
  );
});
