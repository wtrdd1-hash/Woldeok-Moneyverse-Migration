import { describe, expect, it, vi } from 'vitest';

const { mutate, api } = vi.hoisted(() => ({ mutate: vi.fn(), api: vi.fn() }));
vi.mock('@/lib/mutate', () => ({ mutate }));
vi.mock('@/lib/api', () => ({ api }));
vi.mock('@/lib/viewer', () => ({ viewerOrUnknown: vi.fn(async () => ({ signedIn: true })) }));
vi.mock('@/lib/finance-mutation-origin', () => ({ isSameOriginFinanceMutation: vi.fn(() => true) }));

import { POST } from './route';

// 2026-11-26: the API now requires the session's CSRF proof for burn-draw participation, so the
// BFF must spend it (mutate fetches it from the session) instead of posting without one.
describe('burn-draw participation BFF', () => {
  it('forwards the write with the session CSRF proof via mutate', async () => {
    mutate.mockResolvedValueOnce({ ok: true });
    const response = await POST(new Request('http://localhost:3000/api/events/burn-draw', {
      method: 'POST', headers: { origin: 'http://localhost:3000', 'content-type': 'application/json' },
      body: JSON.stringify({ amount: '10' }),
    }));
    expect(response.status).toBe(200);
    expect(mutate).toHaveBeenCalledWith('/api/v1/economy/events/burn-draw/participate',
      expect.objectContaining({ method: 'POST', body: { amount: '10' } }));
    expect(api).not.toHaveBeenCalledWith('/api/v1/economy/events/burn-draw/participate', expect.anything());
  });
});
