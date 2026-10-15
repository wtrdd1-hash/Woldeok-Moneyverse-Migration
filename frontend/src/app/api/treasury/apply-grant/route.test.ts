import { describe, expect, it } from 'vitest';
import * as grantRoute from './route';

describe('Legacy treasury grant Next route build contract v678', () => {
  it('exports only Next.js sanctioned route module keys', () => {
    expect(Object.keys(grantRoute).sort()).toEqual(['POST', 'dynamic']);
  });

  it('keeps public submission unavailable until verified identity and DB settlement', async () => {
    const response = await grantRoute.POST(new Request('http://localhost/api/treasury/apply-grant', { method: 'POST' }));
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect((await response.json()).ok).toBe(false);
  });
});
