import { describe, it, expect, vi } from 'vitest';
import { POST } from '../api/advisor/deoki/rebalance/execute/route';
import { viewerOrUnknown } from '@/lib/viewer';
vi.mock('@/lib/viewer', () => ({ viewerOrUnknown: vi.fn() }));
describe('Advisor rebalance ledger gate', () => {
  it('returns no receipt even to a signed-in member', async () => {
    vi.mocked(viewerOrUnknown).mockResolvedValue({ signedIn: true } as never);
    const res = await POST(new Request('http://localhost/api/advisor/deoki/rebalance/execute', { method: 'POST' }));
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.receipt).toBeUndefined();
  });
});
