import { describe, expect, it, vi } from 'vitest';
vi.mock('@/lib/session', () => ({ isLoggedInMember: vi.fn(async () => true) }));
import { GET } from './route';

describe('v1415 public treasury API', () => {
  it('returns truthful 503 with no fake financial totals or payments', async () => {
    const response = await GET();
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    const json = await response.json();
    expect(json.status).toBe('UNVERIFIED');
    expect(json.overview.totalBalanceWld).toBe('—');
    expect(json.recentLedger).toEqual([]);
    expect(JSON.stringify(json)).not.toContain('3420000');
    expect(JSON.stringify(json)).not.toContain('25000000');
    expect(json.userEligibility.citizenDividendEligible).toBe(false);
  });
});
