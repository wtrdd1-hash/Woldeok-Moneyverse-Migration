import { beforeEach, describe, expect, it, vi } from 'vitest';

const mutate = vi.hoisted(() => vi.fn(async () => ({})));
const spend = vi.hoisted(() => vi.fn(async () => undefined));
const revalidate = vi.hoisted(() => vi.fn());
vi.mock('@/lib/mutate', () => ({
  mutate, failure: vi.fn(() => ({ status: 'error', message: 'failed' })),
  idempotencyKey: () => '00000000-0000-4000-8000-000000000999',
}));
vi.mock('./step-up', () => ({ STEP_UP_CODE: /^.*$/, spendSecondFactorCode: spend }));
vi.mock('next/cache', () => ({ revalidatePath: revalidate }));
vi.mock('next/navigation', () => ({ redirect: vi.fn() }));
vi.mock('@/lib/api', () => ({ api: vi.fn(), apiWithCookie: vi.fn() }));
vi.mock('@/lib/cookie-relay', () => ({ relaySetCookie: vi.fn() }));

import { liftIpAddressBlock } from '../security-actions';

function form(blockId: string): FormData {
  const data = new FormData();
  data.set('blockId', blockId);
  data.set('reason', 'Administrative review completed');
  return data;
}

beforeEach(() => { mutate.mockClear(); spend.mockClear(); revalidate.mockClear(); });

describe('admin IP unblock server action', () => {
  it('rejects malformed or missing block IDs before spending authentication or issuing a DELETE', async () => {
    for (const id of ['undefined', '', 'not-a-uuid']) {
      const result = await liftIpAddressBlock({ status: 'idle' }, form(id));
      expect(result.status).toBe('error');
    }
    expect(spend).not.toHaveBeenCalled();
    expect(mutate).not.toHaveBeenCalled();
  });

  it('passes a verified block UUID through the existing authenticated mutation path', async () => {
    const id = '00000000-0000-4000-8000-000000000101';
    const result = await liftIpAddressBlock({ status: 'idle' }, form(id));
    expect(result.status).toBe('ok');
    expect(mutate).toHaveBeenCalledWith(`/api/v1/admin/security/ip-blocks/${id}`, expect.objectContaining({ method: 'DELETE' }));
    expect(revalidate).toHaveBeenCalledWith('/admin/security');
  });
});
