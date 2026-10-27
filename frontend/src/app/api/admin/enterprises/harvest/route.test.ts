import { describe, expect, it, vi } from 'vitest';
import { POST } from './route';

const apiMock = vi.hoisted(() => vi.fn());
vi.mock('@/lib/api', () => ({ api: apiMock }));

describe('SOE dividend remittance proxy hold', () => {
  it('responds 503 without forwarding financial mutations', async () => {
    const response = await POST();
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ code: 'SOE_DIVIDEND_LEDGER_UNAVAILABLE' });
    expect(apiMock).not.toHaveBeenCalled();
  });
});
