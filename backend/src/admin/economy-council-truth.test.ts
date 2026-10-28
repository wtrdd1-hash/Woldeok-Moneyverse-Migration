import { GUARDS_METADATA } from '@nestjs/common/constants';
import { describe, expect, it, vi } from 'vitest';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminSessionGuard } from '../auth/guards/admin-session.guard';
import { AdminEconomyController } from './economy.controller';

// A generated proposal is not a durable, authenticated council decision.
describe('admin economy council evidence', () => {
  it('returns a 503 with an explicit evidence code without reading a repository', async () => {
    const dashboard = vi.fn();
    const controller = new AdminEconomyController({ dashboard } as never);

    await expect(controller.councilDebate()).rejects.toMatchObject({
      status: 503,
      response: { code: 'COUNCIL_DEBATE_UNVERIFIED' },
    });
    expect(dashboard).not.toHaveBeenCalled();
  });

  it('keeps administrator session and role guards on the endpoint', () => {
    const guards = Reflect.getMetadata(GUARDS_METADATA, AdminEconomyController) as unknown[];
    expect(guards).toContain(AdminGuard);
    expect(guards).toContain(AdminSessionGuard);
  });
});
