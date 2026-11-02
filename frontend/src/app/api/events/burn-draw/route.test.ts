import { beforeEach, describe, expect, it, vi } from 'vitest';

const { api, viewerOrUnknown } = vi.hoisted(() => ({ api: vi.fn(), viewerOrUnknown: vi.fn() }));
vi.mock('@/lib/api', () => ({ api }));
vi.mock('@/lib/viewer', () => ({ viewerOrUnknown }));

import { POST } from './route';

describe('burn draw Next BFF financial settlement hold', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    viewerOrUnknown.mockResolvedValue({ signedIn: true });
    api.mockResolvedValue({ success: true, awardedTitle: 'unverified' });
  });

  it('returns private 503 without forwarding any unledgered WLD mutation', async () => {
    const response = await POST(new Request('http://localhost/api/events/burn-draw', {
      method: 'POST', body: JSON.stringify({ burnAmount: 10000 }),
    }));
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect((await response.json()).code).toBe('BURN_DRAW_LEDGER_UNAVAILABLE');
    expect(api).not.toHaveBeenCalled();
  });

  it('preserves unauthenticated rejection without forwarding a burn', async () => {
    viewerOrUnknown.mockResolvedValue({ signedIn: false });
    const response = await POST(new Request('http://localhost/api/events/burn-draw', { method: 'POST' }));
    expect(response.status).toBe(401);
    expect(api).not.toHaveBeenCalled();
  });
});
