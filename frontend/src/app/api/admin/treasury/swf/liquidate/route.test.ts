import { describe, expect, it, vi } from 'vitest';
const { api } = vi.hoisted(() => ({ api: vi.fn() }));
vi.mock('@/lib/api', () => ({ api, ApiError: class ApiError extends Error {} }));
import { POST } from './route';

describe('v1501 sovereign-fund liquidation BFF containment', () => {
  it('fails closed with 503 and no backend finance mutation', async () => {
    const response = await POST();
    expect(response.status).toBe(503);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(await response.json()).toEqual({ error: 'SWF_LEDGER_SETTLEMENT_UNAVAILABLE' });
    expect(api).not.toHaveBeenCalled();
  });
});
