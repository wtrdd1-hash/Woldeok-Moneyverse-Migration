import { describe, expect, it, vi } from 'vitest';
const { api } = vi.hoisted(() => ({ api: vi.fn() }));
vi.mock('@/lib/api', () => ({ api }));
import { POST } from './route';

describe('retired pension payout browser proxy', () => {
  it('cannot forward browser POST requests to the privileged payout endpoint', async () => {
    const response = await POST();
    expect(response.status).toBe(410);
    expect(api).not.toHaveBeenCalled();
  });
});
