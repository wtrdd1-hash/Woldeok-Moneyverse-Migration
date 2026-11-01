import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { mutate } = vi.hoisted(() => ({ mutate: vi.fn() }));
vi.mock('@/lib/mutate', () => ({ mutate }));
vi.mock('@/lib/api', () => ({
  ApiError: class ApiError extends Error { status: number; constructor(status: number) {
    super('upstream'); this.status = status;
  } },
}));
import { PUT } from './route';

const key = '22222222-2222-4222-8222-222222222222';
const body = { code: 'SOE_POWER', status: 'PAUSED',
  reason: 'Operator governance pause', idempotencyKey: key };
const request = (data: unknown = body, origin = 'https://moneyverse.example') =>
  new Request('https://moneyverse.example/api/admin/enterprises/status', {
    method: 'PUT', headers: { 'content-type':'application/json', origin },
    body: JSON.stringify(data),
  });

describe('v1613 SOE nonmonetary governance BFF', () => {
  const previous = process.env.APP_BASE_URL;
  beforeEach(() => { vi.resetAllMocks(); process.env.APP_BASE_URL = 'https://moneyverse.example'; });
  afterEach(() => { if (previous === undefined) delete process.env.APP_BASE_URL;
    else process.env.APP_BASE_URL = previous; });
  it('blocks cross-origin and malformed requests before calling the CSRF mutation gateway', async () => {
    expect((await PUT(request(body, 'https://attack.example'))).status).toBe(403);
    expect((await PUT(request({ ...body, idempotencyKey: 'fake' }))).status).toBe(400);
    expect(mutate).not.toHaveBeenCalled();
  });
  it('forwards one-time-CSRF protected status change and checks database receipt', async () => {
    const receipt = { receipt_id:key, code:'SOE_POWER',
      old_status:'ACTIVE',new_status:'PAUSED',applied:true,settled:false };
    mutate.mockResolvedValue(receipt);
    const response = await PUT(request());
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(await response.json()).toEqual(receipt);
    expect(mutate).toHaveBeenCalledWith('/api/v1/admin/enterprises/soes/SOE_POWER',
      { method:'PUT', body: {
        status:'PAUSED',reason:'Operator governance pause',idempotencyKey:key,
      } });
  });
  it('rejects forged or non-atomic settlement receipts', async () => {
    mutate.mockResolvedValue({receipt_id:key,code:'SOE_POWER',new_status:'PAUSED',
      applied:true,settled:true});
    const response = await PUT(request());
    expect(response.status).toBe(503);
  });
});
