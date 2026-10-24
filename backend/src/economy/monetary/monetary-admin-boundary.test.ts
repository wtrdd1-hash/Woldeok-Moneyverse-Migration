import 'reflect-metadata';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { describe, expect, it } from 'vitest';
import { AdminSessionGuard } from '../../auth/guards/admin-session.guard';
import { CsrfGuard } from '../../auth/guards/csrf.guard';
import { ReauthGuard } from '../../auth/guards/reauth.guard';
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

  it('does not force recent reauthentication just to read monetary telemetry', () => {
    const guards = (Reflect.getMetadata(
      GUARDS_METADATA,
      MonetaryController.prototype.getTelemetry,
    ) ?? []) as unknown[];
    expect(guards).not.toContain(ReauthGuard);
  });
});
