import { describe, expect, it, vi } from 'vitest';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { OptionalSessionGuard } from '../auth/guards/session.guard';
import { StockLeagueController } from './stock-league.controller';

const config = { cookieSecure: false } as never;
function context(cookie?: string) {
  const request = { headers: cookie ? { cookie } : {} } as any;
  return {
    request,
    context: { switchToHttp: () => ({ getRequest: () => request }) } as any,
  };
}

describe('optional public league session boundary', () => {
  it('loads a valid member session for the public current-league route', async () => {
    const get = vi.fn().mockResolvedValue({ id: 'session-1', user_id: 'member-1' });
    const guard = new OptionalSessionGuard({ get } as never, config);
    const { request, context: ctx } = context('mv_session=valid');
    expect(await guard.canActivate(ctx)).toBe(true);
    expect(get).toHaveBeenCalledWith('valid');
    expect(request.session?.user_id).toBe('member-1');
  });

  it('allows a guest without querying the session store', async () => {
    const get = vi.fn();
    const guard = new OptionalSessionGuard({ get } as never, config);
    expect(await guard.canActivate(context().context)).toBe(true);
    expect(get).not.toHaveBeenCalled();
  });

  it('fails closed on a stale cookie instead of showing a member as not enrolled', async () => {
    const get = vi.fn().mockResolvedValue(null);
    const guard = new OptionalSessionGuard({ get } as never, config);
    await expect(guard.canActivate(context('mv_session=stale').context)).rejects.toMatchObject({ status: 401 });
  });

  it('requires the optional session guard on public current-league GET', () => {
    const guards = Reflect.getMetadata(GUARDS_METADATA, StockLeagueController.prototype.getCurrentLeague);
    expect(guards).toEqual([OptionalSessionGuard]);
  });
});
