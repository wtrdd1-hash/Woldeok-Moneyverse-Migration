import { describe, expect, it } from 'vitest';
import { PUT } from './route';

describe('SOE status legacy gateway hold', () => {
  it('returns 503 and no-store without contacting the private API', async () => {
    const response = await PUT();
    expect(response.status).toBe(503);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(await response.json()).toMatchObject({ code: 'SOE_STATUS_MUTATION_UNVERIFIED' });
  });
});
