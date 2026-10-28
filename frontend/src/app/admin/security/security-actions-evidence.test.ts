import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mutateMock, apiMock, stepMock, refreshMock } = vi.hoisted(() => ({
  mutateMock: vi.fn(), apiMock: vi.fn(), stepMock: vi.fn(), refreshMock: vi.fn(),
}));
vi.mock('next/cache', () => ({ revalidatePath: refreshMock }));
vi.mock('next/navigation', () => ({ redirect: vi.fn() }));
vi.mock('@/lib/api', () => ({ api: apiMock, apiWithCookie: vi.fn() }));
vi.mock('@/lib/mutate', () => ({ mutate: mutateMock, idempotencyKey: () => 'c2f2e1a4-9f35-4c1e-b131-102a11df51a1', failure: () => ({ status: 'error', message: 'API failure' }) }));
vi.mock('../step-up', () => ({ STEP_UP_CODE: /^\d{6}$/, spendSecondFactorCode: stepMock }));
vi.mock('@/lib/cookie-relay', () => ({ relaySetCookie: vi.fn() }));

import { blockIpAddress, liftIpAddressBlock } from '../security-actions';

const blockId = 'a0f7d3c2-11e2-4d90-bb33-1a5b2e6e24cc';
const block = {
  block_id: blockId, network: '203.0.113.5/32', reason: 'Security abuse investigation',
  blocked_by: 'fbb4b8e2-6b1f-4e35-ae8e-339fdb1355f1', blocked_at: '2026-10-26T02:00:00Z',
  expires_at: null, lifted_by: null, lifted_at: null, active: true,
};
function form(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries({ reason: 'Security abuse investigation', code: '123456', ...fields })) data.set(key, value);
  return data;
}
beforeEach(() => { vi.clearAllMocks(); stepMock.mockResolvedValue(undefined); });

describe('admin security write receipts', () => {
  it('rejects an unverified create receipt rather than reporting success', async () => {
    mutateMock.mockResolvedValue({ block_id: 'invalid' });
    const result = await blockIpAddress({ status: 'idle' }, form({ network: '203.0.113.5/32' }));
    expect(result.status).toBe('error');
    expect(result.message).toContain('확인');
  });
  it('verifies create receipt against a fresh authorized API read', async () => {
    mutateMock.mockResolvedValue({ block_id: blockId, network: '203.0.113.5/32', expires_at: null });
    apiMock.mockResolvedValue({ blocks: [block] });
    const result = await blockIpAddress({ status: 'idle' }, form({ network: '203.0.113.5/32' }));
    expect(result.status).toBe('ok');
    expect(apiMock).toHaveBeenCalledWith('/api/v1/admin/security/ip-blocks');
  });
  it('rejects a failed post-write verification without claiming a block was applied', async () => {
    mutateMock.mockResolvedValue({ block_id: blockId, network: '203.0.113.5/32', expires_at: null });
    apiMock.mockResolvedValue({ blocks: [] });
    const result = await blockIpAddress({ status: 'idle' }, form({ network: '203.0.113.5/32' }));
    expect(result.status).toBe('error');
    expect(result.message).toContain('중복');
  });
  it('rejects lift receipt with lifted false or mismatched block id', async () => {
    mutateMock.mockResolvedValueOnce({ block_id: blockId, lifted: false }).mockResolvedValueOnce({ block_id: 'a4f7d3c2-11e2-4d90-bb33-1a5b2e6e24cc', lifted: true });
    expect((await liftIpAddressBlock({ status: 'idle' }, form({ blockId }))).status).toBe('error');
    expect((await liftIpAddressBlock({ status: 'idle' }, form({ blockId }))).status).toBe('error');
  });
  it('confirms lifted state from the fresh API before reporting success', async () => {
    mutateMock.mockResolvedValue({ block_id: blockId, lifted: true });
    apiMock.mockResolvedValue({ blocks: [{ ...block, active: false, lifted_by: block.blocked_by, lifted_at: '2026-10-28T02:00:00Z' }] });
    const result = await liftIpAddressBlock({ status: 'idle' }, form({ blockId }));
    expect(result.status).toBe('ok');
  });
});
