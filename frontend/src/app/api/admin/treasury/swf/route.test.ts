import { describe, expect, it, vi } from 'vitest';
const { api } = vi.hoisted(() => ({ api: vi.fn() }));
vi.mock('@/lib/api', () => ({ api, ApiError: class ApiError extends Error {} }));
import { POST } from './route';

describe('P0 SWF rebalance web gateway', () => {
  it('returns 503 without forwarding a financial mutation to backend', async () => {
    const response = await POST();
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ error: 'SWF_LEDGER_SETTLEMENT_UNAVAILABLE' });
    expect(api).not.toHaveBeenCalled();
  });
});
