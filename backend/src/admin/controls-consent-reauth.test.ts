import 'reflect-metadata';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { describe, expect, it } from 'vitest';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { ReauthGuard } from '../auth/guards/reauth.guard';
import { AdminControlsController } from './controls.controller';

describe('legal consent policy publication authorization', () => {
  it('requires both CSRF and recent reauthentication for publication', () => {
    const guards = (Reflect.getMetadata(
      GUARDS_METADATA,
      AdminControlsController.prototype.publishConsentVersion,
    ) as unknown[]) ?? [];
    expect(guards).toContain(CsrfGuard);
    expect(guards).toContain(ReauthGuard);
  });

  it('preserves the intentional no-step-up emergency feature switch', () => {
    const guards = (Reflect.getMetadata(
      GUARDS_METADATA,
      AdminControlsController.prototype.setAutoPolicyFeatureSwitch,
    ) as unknown[]) ?? [];
    expect(guards).toContain(CsrfGuard);
    expect(guards).not.toContain(ReauthGuard);
  });
});
