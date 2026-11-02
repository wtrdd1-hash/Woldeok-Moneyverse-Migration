import { describe, expect, it, vi } from 'vitest';
import { AuthController } from './auth.controller';

describe('CSRF session privacy', () => {
  it('sets non-cacheable, non-indexable headers without changing the session token', async () => {
    const rotateCsrf = vi.fn().mockResolvedValue('fresh-csrf');
    const controller = new AuthController({} as never, { rotateCsrf } as never, {} as never, null);
    const setHeader = vi.fn();
    const result = await controller.session({ session: { id: 'session-1' }, headers: {} } as never, { setHeader } as never);
    expect(result).toEqual({ csrfToken: 'fresh-csrf' });
    expect(rotateCsrf).toHaveBeenCalledWith('session-1');
    expect(setHeader).toHaveBeenCalledWith('cache-control', 'private, no-store');
    expect(setHeader).toHaveBeenCalledWith('x-robots-tag', 'noindex, nofollow');
  });
});
