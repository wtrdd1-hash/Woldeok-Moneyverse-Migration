import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mutate } = vi.hoisted(() => ({ mutate: vi.fn() }));
vi.mock('@/lib/mutate', () => ({ mutate }));
vi.mock('@/lib/api', () => ({ ApiError: class ApiError extends Error { status = 503; } }));

import { POST } from './route';

const makeRequest = () => new Request('http://localhost:3000/api/admin/treasury/swf/rebalance', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
});

describe('SWF rebalance requires a canonical settlement receipt', () => {
  beforeEach(() => mutate.mockReset());

  it.each([{ executed: false, reason: 'SWF_SETTLEMENT_SOURCE_UNVERIFIED' }, { executed: true }])(
    'returns 503 instead of success for unverified backend result %j',
    async (unverified) => {
      mutate.mockResolvedValueOnce(unverified);
      const res = await POST(makeRequest());
      expect(res.status).toBe(503);
      expect(res.headers.get('Cache-Control')).toContain('no-store');
      expect(await res.json()).toMatchObject({ code: 'SWF_SETTLEMENT_UNVERIFIED' });
    },
  );

  it('returns canonical receipt only when verified service supplies one', async () => {
    const receipt = {
      executed: true,
      reason: 'SWF_REBALANCED',
      ledger_transaction_id: '7b45f2de-1111-4111-8111-444444444444',
    };
    mutate.mockResolvedValueOnce(receipt);
    const res = await POST(makeRequest());
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(receipt);
  });
});
