import { describe, it, expect, vi } from 'vitest';
import { POST } from '../api/advisor/deoki/rebalance/execute/route';

// Mock session
vi.mock('@/lib/session', () => ({
  isLoggedInMember: vi.fn().mockResolvedValue(true),
}));

describe('Advisor 1-Click Rebalance Execution API', () => {
  it('returns successful rebalance execution receipt with filled trades', async () => {
    const req = new Request('http://localhost:3000/api/advisor/deoki/rebalance/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        targetStocksRatio: 55,
        targetBondsRatio: 20,
        targetCashRatio: 25,
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.receipt).toBeDefined();
    expect(json.receipt.executionId).toContain('reb-');
    expect(json.receipt.prIndexBefore).toBe(40);
    expect(json.receipt.prIndexAfter).toBe(88);
    expect(json.receipt.trades.length).toBe(3);
    expect(json.receipt.totalRebalancedWld).toBeGreaterThan(0);
    expect(json.receipt.feeDiscountWld).toBe(1025);
  });
});
