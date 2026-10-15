import { describe, expect, it, vi } from 'vitest';
vi.mock('@/lib/api', () => ({ apiOrNull: vi.fn().mockResolvedValue(null) }));
vi.mock('@/lib/session', () => ({ isLoggedInMember: vi.fn().mockResolvedValue(false) }));
import { GET } from './route';

describe('Treasury public API financial truth v683', () => {
  it('never invents public payment proofs or eligibility before finance reconciliation', async () => {
    const response = await GET();
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    const body = await response.json();
    expect(body).toMatchObject({ ok: false, overview: null, recentLedger: [] });
    expect(JSON.stringify(body)).not.toMatch(/disb-10[1-5]|1420|3420000|1280000|25000000/);
  });
});
