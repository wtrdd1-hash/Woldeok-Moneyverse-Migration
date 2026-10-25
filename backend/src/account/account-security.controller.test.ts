import { describe, expect, it, vi } from 'vitest';
import { GUARDS_METADATA, HEADERS_METADATA } from '@nestjs/common/constants';
import { AccountSecurityController } from './account-security.controller';
import type { AccountSecurityRepository } from './account-security.repository';
import { SessionGuard } from '../auth/guards/session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import type { RequestWithSession } from '../auth/session.context';

describe('owner-only security event export controller', () => {
  it('retains session, authentication, and consent guards', () => {
    expect(Reflect.getMetadata(GUARDS_METADATA, AccountSecurityController)).toEqual([
      SessionGuard, AuthenticatedGuard, ConsentGuard,
    ]);
  });

  it('uses the session owner and the fixed 50-event PostgreSQL limit', async () => {
    const recentEvents = vi.fn().mockResolvedValue([{ type: 'local_login_succeeded', createdAt: '2026-10-26T00:00:00.000Z' }]);
    const controller = new AccountSecurityController({ recentEvents } as unknown as AccountSecurityRepository);
    const request = { session: { user_id: '00000000-0000-4000-8000-000000000001' } } as RequestWithSession;
    expect(await controller.exportEvents(request)).toEqual({
      scope: 'recent-50',
      events: [{ type: 'local_login_succeeded', createdAt: '2026-10-26T00:00:00.000Z' }],
    });
    expect(recentEvents).toHaveBeenCalledWith('00000000-0000-4000-8000-000000000001', 50);
  });

  it('marks export responses private and not indexable', () => {
    const headers = Reflect.getMetadata(HEADERS_METADATA, AccountSecurityController.prototype.exportEvents) as { name: string; value: string }[];
    expect(headers).toEqual(expect.arrayContaining([
      expect.objectContaining({ name: 'Cache-Control', value: 'private, no-store' }),
      expect.objectContaining({ name: 'X-Robots-Tag', value: 'noindex, nofollow' }),
    ]));
  });
});
