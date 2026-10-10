// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { POST } from './route';

describe('obsolete notification claim-all BFF', () => {
  it('never claims rewards through the legacy browser route', async () => {
    const response = await POST();
    expect(response.status).toBe(410);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(await response.json()).toEqual({
      error: 'Notification reward claims are unavailable via this endpoint',
    });
  });
});
