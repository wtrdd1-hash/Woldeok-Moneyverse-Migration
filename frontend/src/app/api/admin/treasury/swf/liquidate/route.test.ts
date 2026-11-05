import { describe, expect, it, vi } from 'vitest';
const { mutate } = vi.hoisted(() => ({ mutate: vi.fn() }));
vi.mock('@/lib/mutate', () => ({ mutate }));
vi.mock('@/lib/api', () => ({ ApiError: class ApiError extends Error { status = 500; } }));
import { POST } from './route';

describe('v641 SWF liquidation web gateway', () => {
  it('forwards liquidation to backend and returns canonical receipt', async () => {
    const mockReceipt = {
      success: true,
      code: 'SWF_LIQUIDATION_SETTLED',
      liquidated_wld: '181056162',
      vault_main_balance: '185055982',
      ledger_transaction_id: 'a0000000-0000-0000-0000-000000000001',
    };
    mutate.mockResolvedValueOnce(mockReceipt);

    const req = new Request('http://localhost:3000/api/admin/treasury/swf/liquidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetPortfolioAumWld: '20000000' }),
    });

    const response = await POST(req);
    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toBe('private, no-store');
    expect(await response.json()).toEqual(mockReceipt);
    expect(mutate).toHaveBeenCalledWith(
      '/api/v1/admin/treasury/swf/liquidate',
      expect.objectContaining({ method: 'POST' }),
    );
  });
});
