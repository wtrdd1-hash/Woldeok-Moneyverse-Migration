import { beforeEach, describe, expect, it, vi } from 'vitest';
const { mutate } = vi.hoisted(() => ({ mutate: vi.fn() }));
vi.mock('@/lib/mutate', () => ({ mutate }));
import { POST as contribute } from './contribute/route';
import { POST as withdraw } from './withdraw/route';

const key = 'aaaa2222-bbbb-4222-8222-ccccdddd0001';
const origin = 'https://example.test';
const request = (path: string, body: unknown, external=false) => new Request(origin+path, {
  method: 'POST',
  headers: { 'content-type': 'application/json', origin: external?'https://evil.test':origin,
    'sec-fetch-site':external?'cross-site':'same-origin' },
  body: JSON.stringify(body),
});

describe('Treasury Core pension Next same-origin mutation boundary', () => {
  beforeEach(() => mutate.mockReset());

  it('forwards valid contribution with unchanged UUIDv4 and exact string amount', async () => {
    mutate.mockResolvedValue({ ledger_transaction_id:key, principal_wld:'1000', user_disbursement_wld:'0', welfare_fee_wld:'0', fund_balance_wld:'1000', replayed:false });
    const res = await contribute(request('/api/pension/funded/contribute', {
      idempotencyKey:key,amountWld:'1000',
    }));
    expect(res.status).toBe(200);
    expect(res.headers.get('cache-control')).toContain('no-store');
    expect(mutate).toHaveBeenCalledWith('/api/v1/pension/funded/contribute', {
      method:'POST',body:{amountWld:'1000',idempotencyKey:key},
    });
  });

  it('rejects cross-origin writes before receiving server CSRF token', async () => {
    const response = await contribute(request('/api/pension/funded/contribute', {
      idempotencyKey:key,amountWld:'1000',
    },true));
    expect(response.status).toBe(403);
    expect(mutate).not.toHaveBeenCalled();
  });

  it('does not accept Number money, negative amounts or malformed idempotency', async () => {
    for(const body of [
      {idempotencyKey:key,amountWld:1000},
      {idempotencyKey:key,amountWld:'-1000'},
      {idempotencyKey:'wrong',amountWld:'1000'},
    ]) {
      const response=await contribute(request('/api/pension/funded/contribute',body));
      expect(response.status).toBe(400);
    }
    expect(mutate).not.toHaveBeenCalled();
  });

  it('keeps withdrawals scoped and never invents cash after a missing receipt', async () => {
    mutate.mockResolvedValue({ principal_wld: '1000' });
    const res=await withdraw(request('/api/pension/funded/withdraw', {
      idempotencyKey:key,principalWld:'1000',
    }));
    expect(res.status).toBe(503);
    expect(await res.json()).toMatchObject({code:'TREASURY_CORE_SETTLEMENT_UNVERIFIED'});
    expect(mutate).toHaveBeenCalledWith('/api/v1/pension/funded/withdraw', {
      method:'POST',body:{principalWld:'1000',idempotencyKey:key},
    });
  });
});
