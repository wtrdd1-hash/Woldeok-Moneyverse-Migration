import { describe, expect, it, vi } from 'vitest';

const { api } = vi.hoisted(() => ({ api: vi.fn() }));
vi.mock('server-only', () => ({}));
vi.mock('./api', () => ({ api }));

import { mutate } from './mutate';

const KEY = '11111111-1111-4111-8111-111111111111';

describe('money-moving mutation retry transport', () => {
  it('forwards a caller-stable idempotency UUID along with the server-only CSRF token', async () => {
    api.mockReset().mockResolvedValueOnce({ csrfToken: 'csrf-token' }).mockResolvedValueOnce({ ok: true });
    await mutate('/api/v1/admin/enterprises/soes/harvest', { method: 'POST', idempotencyKey: KEY });
    expect(api).toHaveBeenNthCalledWith(2, '/api/v1/admin/enterprises/soes/harvest', {
      method: 'POST', body: undefined, csrfToken: 'csrf-token', idempotencyKey: KEY,
    });
  });
  it('rejects malformed keys before touching the session or backend', async () => {
    api.mockReset();
    await expect(mutate('/api/v1/admin/enterprises/soes/harvest', { idempotencyKey: 'bad\nheader' })).rejects.toThrow();
    expect(api).not.toHaveBeenCalled();
  });
});
