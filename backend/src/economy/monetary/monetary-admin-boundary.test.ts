import 'reflect-metadata';
import { ForbiddenException, RequestMethod, UnauthorizedException } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import { GUARDS_METADATA, METHOD_METADATA } from '@nestjs/common/constants';
import { describe, expect, it, vi } from 'vitest';
import { AdminSessionGuard } from '../../auth/guards/admin-session.guard';
import { CsrfGuard } from '../../auth/guards/csrf.guard';
import { ReauthGuard } from '../../auth/guards/reauth.guard';
import type { SessionRepository } from '../../auth/session.repository';
import { MonetaryController } from './monetary.controller';

const writeHandlers = [
  'updateAutoRegulation',
  'runAutoRegulationManually',
  'proposeFromAiCouncil',
  'proposeOrder',
  'approveOrder',
  'freeze',
  'unfreeze',
  'executeMint',
] as const;

describe('monetary policy admin boundary', () => {
  it('requires an elevated console session for all monetary admin reads and writes', () => {
    const guards = Reflect.getMetadata(GUARDS_METADATA, MonetaryController) as unknown[];
    expect(guards).toContain(AdminSessionGuard);
  });

  it.each(writeHandlers)('%s requires CSRF and recent reauthentication before any financial write', (name) => {
    const guards = Reflect.getMetadata(GUARDS_METADATA, MonetaryController.prototype[name]) as unknown[];
    expect(guards).toEqual([CsrfGuard, ReauthGuard]);
  });


  it('covers every currently registered monetary POST, including any newly added write route', () => {
    const postMethods = Object.getOwnPropertyNames(MonetaryController.prototype)
      .filter((name) => {
        const handler = Object.getOwnPropertyDescriptor(MonetaryController.prototype, name)?.value as
          | Function
          | undefined;
        return handler && Reflect.getMetadata(METHOD_METADATA, handler) === RequestMethod.POST;
      });
    expect(postMethods.sort()).toEqual([...writeHandlers].sort());
  });

  it('rejects missing console session, missing CSRF and stale reauthentication before mutation', async () => {
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

  it('does not force recent reauthentication just to read monetary telemetry', () => {
    const guards = (Reflect.getMetadata(
      GUARDS_METADATA,
      MonetaryController.prototype.getTelemetry,
    ) ?? []) as unknown[];
    expect(guards).not.toContain(ReauthGuard);
  });
});
