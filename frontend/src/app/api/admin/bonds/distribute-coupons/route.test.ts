import { describe, expect, it } from 'vitest';
import { POST } from './route';

describe('bond coupon Next gateway', () => {
  it('fails closed before dispatching an uncertified manual settlement', async () => {
    const response = await POST();
    expect(response.status).toBe(503);
    expect((await response.json()).error).toMatch(/certif|검증|보류/i);
  });
});
