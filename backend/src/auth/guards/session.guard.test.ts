import type { ExecutionContext } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import type { AppConfig } from '../../core/config';
import type { SessionRepository } from '../session.repository';
import { SessionGuard } from './session.guard';

function context() {
  const request = { headers: {} as Record<string, string> };
  return {
    request,
    execution: { switchToHttp: () => ({ getRequest: () => request }) } as ExecutionContext,
  };
}

describe('SessionGuard fail-closed behavior', () => {
  it('returns 503 without a session store, never allowing a request through', async () => {
    const guard = new SessionGuard(null, {} as AppConfig);
    await expect(guard.canActivate(context().execution)).rejects.toMatchObject({
      status: 503,
      response: { message: 'session store unavailable' },
    });
  });

  it('returns 401 for an unauthenticated request with a working store', async () => {
    const get = vi.fn().mockResolvedValue(null);
    const guard = new SessionGuard({ get } as unknown as SessionRepository, {} as AppConfig);
    await expect(guard.canActivate(context().execution)).rejects.toMatchObject({
      status: 401,
      response: { message: 'login required' },
    });
    expect(get).toHaveBeenCalledOnce();
  });
});
