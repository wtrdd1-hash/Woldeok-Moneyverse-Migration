import { describe, expect, it, vi } from 'vitest';

const { api } = vi.hoisted(() => ({ api: vi.fn() }));
vi.mock('@/lib/api', () => ({ api }));

import { GET } from './overview/route';
import { POST } from './distribute-coupons/route';

describe('retired browser-accessible bond administrator proxies', () => {
  it('does not disclose owner-identifying coupon logs through a public GET proxy', async () => {
    const response = await GET();
    expect(response.status).toBe(410);
    expect(response.headers.get('cache-control')).toContain('no-store');
    expect(api).not.toHaveBeenCalled();
  });
  it('does not forward unauthenticated browser POST requests to bond settlement', async () => {
    const response = await POST();
    expect(response.status).toBe(410);
    expect(api).not.toHaveBeenCalled();
  });
});
