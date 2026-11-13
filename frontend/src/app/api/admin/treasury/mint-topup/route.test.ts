import { describe, expect, it, vi } from 'vitest';
const { mutate } = vi.hoisted(() => ({ mutate: vi.fn() }));
vi.mock('@/lib/mutate', () => ({ mutate }));
vi.mock('@/lib/api', () => ({ ApiError: class ApiError extends Error { status = 500; } }));
import { POST } from './route';

describe('Admin mint topup gateway route contract', () => {
  it('forwards mint-topup to backend /api/v1/admin/treasury/mint-topup with canonical parameters', async () => {
    const mockReceipt = {
      ok: true,
      message: '조폐국 신규 화폐가 국고로 성공적으로 발행 전입되었습니다.',
      result: {
        ledger_transaction_id: '11111111-2222-3333-4444-555555555555',
        amount_wld: '1000000',
      },
    };
    mutate.mockResolvedValueOnce(mockReceipt);

    const payload = {
      amountWld: '1000000',
      reason: '통화정책 위원회 승인 국고 비상 유동성 즉시 보충',
      otpCode: '937482',
      requestKey: '11111111-1111-4111-8111-111111111111',
    };

    const req = new Request('http://localhost:3000/api/admin/treasury/mint-topup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const response = await POST(req);
    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toBe('private, no-store');
    expect(await response.json()).toEqual(mockReceipt);
    expect(mutate).toHaveBeenCalledWith(
      '/api/v1/admin/treasury/mint-topup',
      expect.objectContaining({
        method: 'POST',
        body: payload,
      }),
    );
  });
});
