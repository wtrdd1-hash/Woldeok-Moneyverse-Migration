import { describe, expect, it, vi } from 'vitest';
import { EnterpriseRepository } from './enterprise.repository';
import type { Queryable } from '../../core/db';

const disclosure = {
  overview: { holding_name: 'WSHC', total_soe_assets_wld: '9007199254740993', hourly_soe_dividends_wld: '30' },
  soes: [{ code: 'SOE_A' }], privateEnterprises: [],
  financial_data_status: 'PROJECTION_ONLY_UNVERIFIED', ledger_confirmed: false,
};

describe('public enterprise DB-owned read boundary', () => {
  it('uses one SECDEF function call, never app-role direct table SELECT', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [{ disclosure }] });
    const repository = new EnterpriseRepository({ query } as unknown as Queryable);
    expect(await repository.getPublicDisclosure()).toEqual(disclosure);
    expect(query).toHaveBeenCalledOnce();
    const sql = query.mock.calls[0]?.[0] as string;
    expect(sql).toMatch(/SELECT public\.enterprise_public_disclosure_v1\(\)/);
    expect(sql).not.toMatch(/FROM public\.(state_enterprises|private_enterprises)/);
  });
  it('fails closed when the function is unavailable or returned no row', async () => {
    for (const result of [Promise.resolve({ rows: [] }), Promise.reject(new Error('private SQL details'))]) {
      const query = vi.fn().mockImplementation(() => result);
      const repository = new EnterpriseRepository({ query } as unknown as Queryable);
      await expect(repository.getPublicDisclosure()).rejects.toThrow('Public enterprise disclosure unavailable');
    }
  });
});
