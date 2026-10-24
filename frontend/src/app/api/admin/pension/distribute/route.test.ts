import { describe, expect, it, vi } from 'vitest';

const { api } = vi.hoisted(() => ({ api: vi.fn() }));
vi.mock('@/lib/api', () => ({ api }));
import { POST } from './route';

describe('pension payout API gateway hold', () => {
  it('returns 503 with no-store and never forwards a financial mutation', async () => {
    const response = await POST();
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(await response.json()).toMatchObject({
      ok: false,
      code: 'PENSION_LEDGER_SETTLEMENT_UNCERTIFIED',
    });
    expect(api).not.toHaveBeenCalled();
  });
});
