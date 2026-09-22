import { GUARDS_METADATA } from '@nestjs/common/constants';
import { describe, expect, it } from 'vitest';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { ReauthGuard } from '../auth/guards/reauth.guard';
import { AdminControlsController } from './controls.controller';

function guardsOn(method: keyof AdminControlsController): unknown[] {
  return (
    (Reflect.getMetadata(
      GUARDS_METADATA,
      AdminControlsController.prototype[method],
    ) as unknown[]) ?? []
  );
}

describe('AdminControlsController feature switch guards', () => {
  it('keeps the automatic economy switch behind CSRF without either step-up', () => {
    const guards = guardsOn('setAutoPolicyFeatureSwitch');
    expect(guards).toContain(CsrfGuard);
    expect(guards).not.toContain(ReauthGuard);
  });

  it('keeps every other feature switch behind CSRF without additional authentication', () => {
    const guards = guardsOn('setFeatureSwitch');
    expect(guards).toContain(CsrfGuard);
    expect(guards).not.toContain(ReauthGuard);
  });
});


describe('AdminControlsController administrative role guards', () => {
  it.each(['grantRole', 'revokeRole'] as const)('%s requires CSRF and recent reauthentication', (method) => {
    const guards = guardsOn(method);
    expect(guards).toContain(CsrfGuard);
    expect(guards).toContain(ReauthGuard);
  });
});
