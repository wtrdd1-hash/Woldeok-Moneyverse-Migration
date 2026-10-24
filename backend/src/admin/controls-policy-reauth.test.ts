import { GUARDS_METADATA } from '@nestjs/common/constants';
import { describe, expect, it } from 'vitest';
import { AdminSessionGuard } from '../auth/guards/admin-session.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { ReauthGuard } from '../auth/guards/reauth.guard';
import { AdminControlsController } from './controls.controller';

function guardsOn(method: keyof AdminControlsController): unknown[] {
  return (Reflect.getMetadata(GUARDS_METADATA, AdminControlsController.prototype[method]) as unknown[]) ?? [];
}

describe('economy policy administration step-up', () => {
  it('requires an administrator console session at the controller boundary', () => {
    const guards = (Reflect.getMetadata(GUARDS_METADATA, AdminControlsController) as unknown[]) ?? [];
    expect(guards).toContain(AdminSessionGuard);
  });

  it.each([
    'createPolicyVersion',
    'rollbackPolicy',
    'activateDuePolicies',
    'runAutoPolicy',
    'setPolicyKnob',
  ] as const)('%s requires CSRF and recent identity reauthentication', (method) => {
    expect(guardsOn(method)).toContain(CsrfGuard);
    expect(guardsOn(method)).toContain(ReauthGuard);
  });

  it.each(['setFeatureSwitch', 'setAutoPolicyFeatureSwitch'] as const)(
    '%s retains the explicitly authorized no-step-up feature-switch policy', (method) => {
      expect(guardsOn(method)).toContain(CsrfGuard);
      expect(guardsOn(method)).not.toContain(ReauthGuard);
    },
  );
});
