import { describe, expect, it } from 'vitest';
import { GET } from './route';

describe('public treasury overview provenance', () => {
  it('fails closed without a public ledger-backed treasury read contract', async () => {
    const response = await GET();
    expect(response.status).toBe(503);
    expect(response.headers.get('Cache-Control')).toContain('no-store');
    const body = await response.json();
    expect(body).toMatchObject({
      ok: false,
      code: 'TREASURY_PUBLIC_DISCLOSURE_UNAVAILABLE',
      overview: null,
      recentLedger: [],
      userEligibility: null,
    });
    expect(JSON.stringify(body)).not.toMatch(/disb-101|25000000|3420000|1280000|1420|3,200/);
  });
});
