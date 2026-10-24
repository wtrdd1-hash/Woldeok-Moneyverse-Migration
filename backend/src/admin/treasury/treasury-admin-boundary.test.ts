import 'reflect-metadata';
import { ForbiddenException, RequestMethod, UnauthorizedException } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import { GUARDS_METADATA, METHOD_METADATA } from '@nestjs/common/constants';
import { describe, expect, it, vi } from 'vitest';
import { AdminSessionGuard } from '../../auth/guards/admin-session.guard';
import { CsrfGuard } from '../../auth/guards/csrf.guard';
import { ReauthGuard } from '../../auth/guards/reauth.guard';
import type { SessionRepository } from '../../auth/session.repository';
import { AdminTreasuryController } from './treasury.controller';

const mutationHandlers = [
  'injectFunds',
  'absorbFunds',
  'disburseDividend',
  'disburseTargetedSubsidy',
  'userDonate',
  'disburseGrant',
  'distributeBudget',
  'buybackBurn',
  'executeWealthTax',
  'createBackupSnapshot',
  'triggerSwfRebalance',
  'liquidateSwfToTreasury',
  'updateSwfConfig',
] as const;

describe('treasury admin financial boundary', () => {
  it('requires an elevated console session for treasury admin reads and writes', () => {
    const guards = Reflect.getMetadata(GUARDS_METADATA, AdminTreasuryController) as unknown[];
    expect(guards).toContain(AdminSessionGuard);
  });

  it.each(mutationHandlers)('%s requires CSRF and recent reauthentication', (name) => {
    const guards = Reflect.getMetadata(
      GUARDS_METADATA,
      AdminTreasuryController.prototype[name],
    ) as unknown[];
    expect(guards).toEqual([CsrfGuard, ReauthGuard]);
  });

  it('covers every registered POST and PUT so new financial writes cannot silently bypass the guards', () => {
    const mutations = Object.getOwnPropertyNames(AdminTreasuryController.prototype)
      .filter((name) => {
        const handler = Object.getOwnPropertyDescriptor(AdminTreasuryController.prototype, name)?.value as
          | object
          | undefined;
        if (!handler) return false;
        const method = Reflect.getMetadata(METHOD_METADATA, handler) as RequestMethod | undefined;
        return method === RequestMethod.POST || method === RequestMethod.PUT;
      });
    expect(mutations.sort()).toEqual([...mutationHandlers].sort());
  });

  it('fails closed for missing console session, CSRF token and stale reauthentication', async () => {
    const sessions = {
      touchAdminSession: vi.fn().mockResolvedValue({ state: 'absent' }),
      verifyCsrf: vi.fn(),
      hasRecentReauthentication: vi.fn().mockResolvedValue(false),
    } as unknown as SessionRepository;
    const request = { method: 'POST', headers: {}, session: { id: 'session', user_id: 'actor' } };
    const context = {
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;
    await expect(new AdminSessionGuard(sessions).canActivate(context)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    await expect(new CsrfGuard(sessions).canActivate(context)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    await expect(new ReauthGuard(sessions).canActivate(context)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(sessions.touchAdminSession).toHaveBeenCalledOnce();
  });

  it('permits an open admin console with a valid CSRF token and fresh reauthentication', async () => {
    const sessions = {
      touchAdminSession: vi.fn().mockResolvedValue({ state: 'open' }),
      verifyCsrf: vi.fn().mockResolvedValue(true),
      hasRecentReauthentication: vi.fn().mockResolvedValue(true),
    } as unknown as SessionRepository;
    const request = {
      method: 'POST',
      headers: { 'x-csrf-token': 'valid-token' },
      session: { id: 'session', user_id: 'actor' },
    };
    const context = {
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;
    expect(await new AdminSessionGuard(sessions).canActivate(context)).toBe(true);
    expect(await new CsrfGuard(sessions).canActivate(context)).toBe(true);
    expect(await new ReauthGuard(sessions).canActivate(context)).toBe(true);
    expect(sessions.verifyCsrf).toHaveBeenCalledWith('session', 'valid-token');
  });

  it('does not require repeated reauthentication for read-only treasury status', () => {
    const guards = (Reflect.getMetadata(
      GUARDS_METADATA,
      AdminTreasuryController.prototype.getOverview,
    ) ?? []) as unknown[];
    expect(guards).not.toContain(ReauthGuard);
  });
});
