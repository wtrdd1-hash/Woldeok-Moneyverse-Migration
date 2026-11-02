import { Test } from '@nestjs/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { INestApplication } from '@nestjs/common';
import { CONFIG } from '../core/config';
import { SessionRepository } from '../auth/session.repository';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminSessionGuard } from '../auth/guards/admin-session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { ActivityController } from './activity.controller';
import { ActivityService } from './activity.service';

let app: INestApplication | null = null;
afterEach(async () => {
  if (app) await app.close();
  app = null;
});

describe('POST /activity/events session provenance HTTP contract', () => {
  it('returns a source-unverified 503 and does not record anonymous telemetry when a session lookup fails', async () => {
    const recordEvents = vi.fn().mockResolvedValue({ recorded: 1 });
    const get = vi.fn().mockRejectedValue(new Error('database temporarily unavailable'));
    const module = await Test.createTestingModule({
      controllers: [ActivityController],
      providers: [
        { provide: ActivityService, useValue: { recordEvents } },
        { provide: SessionRepository, useValue: { get } },
        { provide: CONFIG, useValue: { cookieSecure: false, trustProxyForwardedFor: false } },
      ],
    })
      .overrideGuard(SessionGuard).useValue({ canActivate: () => true })
      .overrideGuard(AuthenticatedGuard).useValue({ canActivate: () => true })
      .overrideGuard(ConsentGuard).useValue({ canActivate: () => true })
      .overrideGuard(AdminGuard).useValue({ canActivate: () => true })
      .overrideGuard(AdminSessionGuard).useValue({ canActivate: () => true })
      .compile();
    app = module.createNestApplication();
    await app.listen(0, '127.0.0.1');
    const url = `${await app.getUrl()}/activity/events`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie: 'mv_session=valid' },
      body: JSON.stringify({ events: [] }),
    });
    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({ code: 'ACTIVITY_SESSION_UNVERIFIED' });
    expect(recordEvents).not.toHaveBeenCalled();

    const anonymous = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ events: [] }),
    });
    expect(anonymous.status).toBe(200);
    expect(await anonymous.json()).toEqual({ recorded: 1 });
    expect(recordEvents).toHaveBeenCalledTimes(1);
    expect(recordEvents.mock.calls[0]?.[1]).toBeNull();
    expect(get).toHaveBeenCalledTimes(1);
  });
});
