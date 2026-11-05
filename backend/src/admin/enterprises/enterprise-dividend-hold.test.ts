import { describe, expect, it, vi } from 'vitest';
import { EnterpriseRepository } from './enterprise.repository';

describe('SOE canonical dividend harvest to vault', () => {
  it('calls canonical DB procedure admin_soe_harvest_dividends_to_vault with admin actor', async () => {
    const mockHarvest = {
      success: true,
      code: 'SOE_DIVIDEND_HARVESTED',
      message: '공기업 배당금이 국고 중앙 금고(VAULT_MAIN)로 복식부기 입금되었습니다.',
      total_dividends_collected: '108000',
      enterprises_processed: 3,
      treasury_balance_after: '191163911',
      ledger_transaction_id: 'tx-uuid-1234',
    };
    const query = vi.fn().mockResolvedValue({
      rows: [{ harvest: mockHarvest }],
    });
    const repository = new EnterpriseRepository({ query } as any);

    const result = await repository.distributeSoeDividends('admin-uuid-5678');

    expect(query).toHaveBeenCalledWith(
      'SELECT public.admin_soe_harvest_dividends_to_vault($1::uuid) AS harvest',
      ['admin-uuid-5678'],
    );
    expect(result).toEqual({
      total_dividends_collected: '108000',
      enterprises_processed: 3,
      treasury_balance_after: '191163911',
      ledger_transaction_id: 'tx-uuid-1234',
    });
  });

  it('rejects execution when adminId is missing', async () => {
    const query = vi.fn();
    const repository = new EnterpriseRepository({ query } as any);

    await expect(repository.distributeSoeDividends(undefined)).rejects.toMatchObject({
      status: 503,
      response: expect.objectContaining({ code: 'SOE_DIVIDEND_ACTOR_REQUIRED' }),
    });
    expect(query).not.toHaveBeenCalled();
  });
});
