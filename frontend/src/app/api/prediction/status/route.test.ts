import { describe, expect, it } from 'vitest';
import { GET } from './route';

describe('GET /api/prediction/status', () => {
  it('fails closed without exposing fabricated markets or claiming ledger settlement', async () => {
    const response = await GET();
    expect(response.status).toBe(503);
    expect(response.headers.get('Cache-Control')).toContain('no-store');
    expect(await response.json()).toEqual({
      available: false,
      reason: 'NO_SETTLEMENT_CONTRACT',
      markets: [],
    });
  });
});
