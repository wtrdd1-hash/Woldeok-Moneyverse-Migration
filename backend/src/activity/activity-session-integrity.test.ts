import { ServiceUnavailableException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import type { SessionRepository } from '../auth/session.repository';
import type { RequestWithSession } from '../auth/session.context';
import type { AppConfig } from '../core/config';
import { ActivityController } from './activity.controller';
import type { ActivityService } from './activity.service';

function setup(options: { cookie?: string; get?: ReturnType<typeof vi.fn>; noStore?: boolean } = {}) {
  const recordEvents = vi.fn().mockResolvedValue({ recorded: 1 });
  const get = options.get ?? vi.fn().mockResolvedValue(null);
  const controller = new ActivityController(
    { recordEvents } as unknown as ActivityService,
    { cookieSecure: false, trustProxyForwardedFor: false } as AppConfig,
    options.noStore ? null : ({ get } as unknown as SessionRepository),
  );
  const request = {
    headers: { ...(options.cookie ? { cookie: options.cookie } : {}), 'user-agent': 'regression-test' },
    socket: { remoteAddress: undefined },
  } as unknown as RequestWithSession;
  const body = { events: [] } as Parameters<ActivityController['ingestEvents']>[1];
  return { controller, request, body, get, recordEvents };
}

describe('ActivityController telemetry actor provenance', () => {
  it('rejects a session-store outage for a request carrying an auth cookie without recording anonymous activity', async () => {
    const fixture = setup({ cookie: 'mv_session=valid', get: vi.fn().mockRejectedValue(new Error('connection lost')) });
    await expect(fixture.controller.ingestEvents(fixture.request, fixture.body))
      .rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(fixture.recordEvents).not.toHaveBeenCalled();
  });

  it('rejects cookie-backed activity when the session store is unavailable', async () => {
    const fixture = setup({ cookie: 'mv_session=valid', noStore: true });
    await expect(fixture.controller.ingestEvents(fixture.request, fixture.body))
      .rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(fixture.recordEvents).not.toHaveBeenCalled();
  });

  it('preserves truly anonymous activity without a cookie', async () => {
    const fixture = setup();
    await expect(fixture.controller.ingestEvents(fixture.request, fixture.body)).resolves.toEqual({ recorded: 1 });
    expect(fixture.get).not.toHaveBeenCalled();
    expect(fixture.recordEvents).toHaveBeenCalledWith([], null, null, 'regression-test', null);
  });

  it('attributes a verified session to the server-returned actor only', async () => {
    const fixture = setup({ cookie: 'mv_session=valid', get: vi.fn().mockResolvedValue({ user_id: 'verified-actor' }) });
    await fixture.controller.ingestEvents(fixture.request, fixture.body);
    expect(fixture.recordEvents).toHaveBeenCalledWith([], 'verified-actor', null, 'regression-test', null);
  });

  it('does not invent an actor when a cookie is invalid but the session store responds', async () => {
    const fixture = setup({ cookie: 'mv_session=invalid' });
    await fixture.controller.ingestEvents(fixture.request, fixture.body);
    expect(fixture.recordEvents).toHaveBeenCalledWith([], null, null, 'regression-test', null);
  });
});
