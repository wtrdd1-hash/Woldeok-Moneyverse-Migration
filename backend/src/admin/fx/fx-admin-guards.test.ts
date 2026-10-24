import { GUARDS_METADATA } from '@nestjs/common/constants';
import { describe, expect, it } from 'vitest';
import { AdminSessionGuard } from '../../auth/guards/admin-session.guard';
import { CsrfGuard } from '../../auth/guards/csrf.guard';
import { ReauthGuard } from '../../auth/guards/reauth.guard';
import { AdminFxController, PublicFxController } from './fx.controller';

function guardsOn(target: object, method?: string): unknown[] {
  return (
    (Reflect.getMetadata(
      GUARDS_METADATA,
      method ? (target as Record<string, unknown>)[method] : target,
    ) as unknown[]) ?? []
  );
}

describe('FX administrator security boundary', () => {
  it('requires an open administrator console for every admin FX route', () => {
    expect(guardsOn(AdminFxController)).toContain(AdminSessionGuard);
  });

  it.each(['intervene', 'drawdownSwap', 'settleForward', 'toggleHalt'])(
    'requires CSRF and recent reauthentication for %s',
    (method) => {
      const guards = guardsOn(AdminFxController.prototype, method);
      expect(guards).toContain(CsrfGuard);
      expect(guards).toContain(ReauthGuard);
    },
  );

  it('does not put administrator console guards on the public FX portal', () => {
    expect(guardsOn(PublicFxController)).not.toContain(AdminSessionGuard);
  });
});
