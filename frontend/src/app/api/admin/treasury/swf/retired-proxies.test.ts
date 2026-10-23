import { describe, expect, it, vi } from 'vitest';

const { api } = vi.hoisted(() => ({ api: vi.fn() }));
vi.mock('@/lib/api', () => ({ api, ApiError: class ApiError extends Error {} }));

import { GET, POST, PUT } from './route';
import { POST as liquidate } from './liquidate/route';

describe('retired browser-facing treasury SWF proxy', () => {
  it('refuses every previous read/write route without contacting the privileged backend', async () => {
    const responses = await Promise.all([
      GET(), POST(), PUT(),
      liquidate(new Request('http://localhost/api/admin/treasury/swf/liquidate', { method: 'POST' })),
    ]);
    for (const response of responses) {
      expect(response.status).toBe(410);
      expect(response.headers.get('cache-control')).toBe('private, no-store');
    }
    expect(api).not.toHaveBeenCalled();
  });
});
