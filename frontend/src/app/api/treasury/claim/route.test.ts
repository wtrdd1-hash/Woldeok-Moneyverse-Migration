import { describe, expect, it } from 'vitest';
import * as claimRoute from './route';

describe('Treasury claim route contract', () => {
  it('exports only Next.js sanctioned route module keys', () => {
    expect(Object.keys(claimRoute).sort()).toEqual(['POST', 'dynamic']);
  });

  it('rejects missing programId with 400 Bad Request', async () => {
    const request = new Request('http://localhost/api/treasury/claim', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({}),
    });
    const response = await claimRoute.POST(request);
    expect(response.status).toBe(400);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    const data = await response.json();
    expect(data.ok).toBe(false);
  });

  it('successfully handles citizen dividend claim with 200 OK', async () => {
    const request = new Request('http://localhost/api/treasury/claim', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ programId: 'CITIZEN_DIVIDEND' }),
    });
    const response = await claimRoute.POST(request);
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    const data = await response.json();
    expect(data.ok).toBe(true);
    expect(data.settlementType).toBe('SCHEDULED_BATCH');
  });

  it('successfully handles emergency relief claim with 200 OK', async () => {
    const request = new Request('http://localhost/api/treasury/claim', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ programId: 'EMERGENCY_RELIEF' }),
    });
    const response = await claimRoute.POST(request);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.ok).toBe(true);
    expect(data.settlementType).toBe('WELFARE_GRANT');
  });
});
