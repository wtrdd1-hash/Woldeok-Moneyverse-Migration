import { describe, expect, it, vi, beforeEach } from 'vitest';
import * as certificatesRoute from './certificates/route';
import * as ordersRoute from './orders/route';
import * as executeMintRoute from './execute-mint/route';
import * as executeRetireRoute from './execute-retire/route';
import * as freezeRoute from './freeze/route';
import { api } from '@/lib/api';
import { mutate } from '@/lib/mutate';

vi.mock('@/lib/api', () => ({
  api: vi.fn(),
  ApiError: class extends Error {
    constructor(public status: number, message: string) {
      super(message);
    }
  },
}));

vi.mock('@/lib/mutate', () => ({
  mutate: vi.fn(),
}));

describe('Admin Mint Bureau BFF Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET certificates fetches mints and retirements in parallel', async () => {
    vi.mocked(api).mockImplementation((path) => {
      if (typeof path === 'string' && path.includes('mints')) {
        return Promise.resolve([{ id: 'mint-1', amount_wld: '1000' }]) as never;
      }
      return Promise.resolve([{ id: 'retire-1', amount_wld: '500' }]) as never;
    });

    const res = await certificatesRoute.GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.mints).toHaveLength(1);
    expect(body.retirements).toHaveLength(1);
  });

  it('GET orders returns policy orders list', async () => {
    vi.mocked(api).mockResolvedValueOnce([{ id: 'order-1', status: 'APPROVED' }] as never);
    const res = await ordersRoute.GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.orders).toHaveLength(1);
  });

  it('rejects unsupported TREASURY envelope in policy proposal before any backend mutation', async () => {
    const req = {
      headers: new Headers(),
      json: async () => ({ order_type: 'MINT', target_envelope: 'TREASURY',
        max_amount_wld: '10000000', reason: '운영 국고 증액 정책 발의 감사 사유', valid_duration_hours: 72 }),
    } as never;
    const res = await ordersRoute.POST(req);
    expect(res.status).toBe(422);
    expect(await res.json()).toMatchObject({ code: 'UNSUPPORTED_MONETARY_POLICY' });
    expect(mutate).not.toHaveBeenCalled();
  });

  it('accepts a supported policy proposal using existing DB constraints', async () => {
    vi.mocked(mutate).mockResolvedValueOnce({ id: 'new-policy-1' } as never);
    const req = {
      headers: new Headers(),
      json: async () => ({ order_type: 'MINT', target_envelope: 'WORK_REWARD',
        max_amount_wld: '10000000', reason: '승인 가능한 작업 보상 한도 정책', valid_duration_hours: 72 }),
    } as never;
    const res = await ordersRoute.POST(req);
    expect(res.status).toBe(200);
    expect(mutate).toHaveBeenCalledWith('/api/v1/admin/economy/monetary/orders/propose',
      expect.objectContaining({ method: 'POST' }));
  });

  it('POST execute-mint executes authorized mint via backend', async () => {
    vi.mocked(mutate).mockResolvedValueOnce({ id: 'cert-123', amount_wld: '100000' } as never);
    const req = {
      headers: new Headers(),
      json: async () => ({
        policy_order_id: 'order-1',
        amount_wld: '100000',
        recipient_user_id: null,
        idempotency_key: 'test-key',
      }),
    } as never;

    const res = await executeMintRoute.POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id).toBe('cert-123');
    expect(mutate).toHaveBeenCalledWith('/api/v1/admin/economy/monetary/execute-mint', expect.objectContaining({
      method: 'POST',
    }));
  });

  it('POST execute-retire executes retirement via backend', async () => {
    vi.mocked(mutate).mockResolvedValueOnce({ id: 'retire-cert-1', amount_wld: '50000' } as never);
    const req = {
      headers: new Headers(),
      json: async () => ({
        policy_order_id: null,
        amount_wld: '50000',
        source_type: 'TREASURY_VAULT',
        reason: '정기 소각',
        idempotency_key: 'test-retire-key',
      }),
    } as never;

    const res = await executeRetireRoute.POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id).toBe('retire-cert-1');
    expect(mutate).toHaveBeenCalledWith('/api/v1/admin/economy/monetary/execute-retire', expect.objectContaining({
      method: 'POST',
    }));
  });

  it('POST freeze toggles freeze or unfreeze correctly', async () => {
    vi.mocked(mutate).mockResolvedValueOnce({ is_issuance_frozen: true } as never);
    const freezeReq = {
      headers: new Headers(),
      json: async () => ({ freeze: true, reason: '긴급 동결' }),
    } as never;
    const freezeRes = await freezeRoute.POST(freezeReq);
    expect(freezeRes.status).toBe(200);
    expect(mutate).toHaveBeenCalledWith('/api/v1/admin/economy/monetary/freeze', expect.anything());

    vi.mocked(mutate).mockResolvedValueOnce({ is_issuance_frozen: false } as never);
    const unfreezeReq = {
      headers: new Headers(),
      json: async () => ({ freeze: false }),
    } as never;
    const unfreezeRes = await freezeRoute.POST(unfreezeReq);
    expect(unfreezeRes.status).toBe(200);
    expect(mutate).toHaveBeenCalledWith('/api/v1/admin/economy/monetary/unfreeze', expect.anything());
  });
  it("POST execute-mint rejects untrusted cross-origin requests", async () => {
    const headers = new Headers();
    headers.set("origin", "https://malicious-origin.com");
    const req = {
      headers,
      url: "http://localhost/api/admin/mint/execute-mint",
      json: async () => ({}),
    } as never;
    const res = await executeMintRoute.POST(req);
    expect(res.status).toBe(403);
    expect(mutate).not.toHaveBeenCalled();
  });
});