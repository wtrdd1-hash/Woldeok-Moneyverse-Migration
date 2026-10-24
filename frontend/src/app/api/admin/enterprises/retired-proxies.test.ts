import { describe, expect, it } from 'vitest';
import { POST } from './harvest/route';
import { PUT } from './status/route';

describe('retired browser-accessible enterprise treasury mutations', () => {
  it('does not proxy browser harvest requests with server credentials', async () => {
    const response = await POST();
    expect(response.status).toBe(410);
  });
  it('does not proxy browser SOE status writes with server credentials', async () => {
    const response = await PUT();
    expect(response.status).toBe(410);
  });
});
