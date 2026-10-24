import 'reflect-metadata';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { describe, expect, it } from 'vitest';
import { AdminSessionGuard } from '../../auth/guards/admin-session.guard';
import { CsrfGuard } from '../../auth/guards/csrf.guard';
import { ReauthGuard } from '../../auth/guards/reauth.guard';
import { AdminKdicController, PublicKdicController } from './kdic.controller';

function methodGuards(method: keyof AdminKdicController): unknown[] {
  return (Reflect.getMetadata(GUARDS_METADATA, AdminKdicController.prototype[method]) as unknown[]) ?? [];
}

describe('KDIC administrator privilege boundary', () => {
  it('requires a separate open administrator console for every admin route', () => {
    const guards = (Reflect.getMetadata(GUARDS_METADATA, AdminKdicController) as unknown[]) ?? [];
    expect(guards).toContain(AdminSessionGuard);
  });

  it.each(['assessPremiums', 'injectLiquidity', 'executePayout'] as const)(
    '%s requires CSRF and recent reauthentication', (method) => {
      expect(methodGuards(method)).toContain(CsrfGuard);
      expect(methodGuards(method)).toContain(ReauthGuard);
    },
  );

  it('does not require admin console on public depositor routes', () => {
    const guards = (Reflect.getMetadata(GUARDS_METADATA, PublicKdicController) as unknown[]) ?? [];
    expect(guards).not.toContain(AdminSessionGuard);
  });
});
