import 'reflect-metadata';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminSessionGuard } from '../auth/guards/admin-session.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import type { RequestWithSession } from '../auth/session.context';
import { AdminHelpController } from './help-admin.controller';
import type { HelpRepository } from './help.repository';

const actor = '00000000-0000-0000-0000-000000000001';
const session = '00000000-0000-0000-0000-000000000010';
const article = '00000000-0000-0000-0000-000000000123';
const key = '00000000-0000-0000-0000-000000000124';
const req = (roles: string[]) => ({ session: { id: session, user_id: actor }, adminRoles: roles }) as RequestWithSession;
afterEach(() => vi.unstubAllEnvs());

describe('help management trust boundary', () => {
  it('requires an active administrator console session and CSRF for every write', () => {
    const guards: unknown[] = Reflect.getMetadata(GUARDS_METADATA, AdminHelpController) ?? [];
    expect(guards).toContain(AdminGuard);
    expect(guards).toContain(AdminSessionGuard);
    for (const name of ['create','publish','retract'] as const) {
      const methodGuards: unknown[] = Reflect.getMetadata(GUARDS_METADATA, AdminHelpController.prototype[name]) ?? [];
      expect(methodGuards).toContain(CsrfGuard);
    }
  });
  it('does not allow an operator-only session to publish', async () => {
    vi.stubEnv('VERIFIED_HELP_CENTER_V1','true');
    const adminPublish = vi.fn();
    const controller = new AdminHelpController({ adminPublish } as unknown as HelpRepository);
    await expect(controller.publish(req(['operator']), article, { idempotencyKey: key, expectedVersion: '1' })).rejects.toThrow('help administrator role required');
    expect(adminPublish).not.toHaveBeenCalled();
  });
  it('reports stale idempotent publication replay as HTTP 409, never a new success', async () => {
    vi.stubEnv('VERIFIED_HELP_CENTER_V1','true');
    const stale = Object.assign(new Error('help publication replay is stale'), { code: '40001' });
    const adminPublish = vi.fn().mockRejectedValue(stale);
    const controller = new AdminHelpController({ adminPublish } as unknown as HelpRepository);
    await expect(controller.publish(req(['approver']), article, { idempotencyKey: key, expectedVersion: '1' }))
      .rejects.toMatchObject({ status: 409 });
    expect(adminPublish).toHaveBeenCalledOnce();
  });
  it('does not offer publication of expired evidence in the administrator queue', async () => {
    vi.stubEnv('VERIFIED_HELP_CENTER_V1','true');
    const adminQueue = vi.fn().mockResolvedValue([
      { article_id: article, author_id: '00000000-0000-0000-0000-000000000002',
        reviewed_until: new Date('2000-01-01T00:00:00Z'), state: 'draft' },
      { article_id: '00000000-0000-0000-0000-000000000125',
        author_id: '00000000-0000-0000-0000-000000000002',
        reviewed_until: new Date('2999-01-01T00:00:00Z'), state: 'draft' },
    ]);
    const controller = new AdminHelpController({ adminQueue } as unknown as HelpRepository);
    const result = await controller.queue(req(['approver']));
    expect(result.articles[0]).toMatchObject({ evidenceExpired: true, canApprove: false });
    expect(result.articles[1]).toMatchObject({ evidenceExpired: false, canApprove: true });
  });
  it('maps expired publication evidence to HTTP 400 rather than a false success', async () => {
    vi.stubEnv('VERIFIED_HELP_CENTER_V1','true');
    const expired = Object.assign(new Error('help source review expired'), { code: '22023' });
    const adminPublish = vi.fn().mockRejectedValue(expired);
    const controller = new AdminHelpController({ adminPublish } as unknown as HelpRepository);
    await expect(controller.publish(req(['approver']), article, { idempotencyKey: key, expectedVersion: '1' }))
      .rejects.toMatchObject({ status: 400 });
  });
  it('requires a committed DB receipt before reporting publication', async () => {
    vi.stubEnv('VERIFIED_HELP_CENTER_V1','true');
    const adminPublish = vi.fn().mockResolvedValue(null);
    const controller = new AdminHelpController({ adminPublish } as unknown as HelpRepository);
    await expect(controller.publish(req(['approver']), article, { idempotencyKey: key, expectedVersion: '1' })).rejects.toThrow('publication unverified');
  });
});
