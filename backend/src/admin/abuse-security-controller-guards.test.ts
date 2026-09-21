import { GUARDS_METADATA } from '@nestjs/common/constants';
import { describe, expect, it } from 'vitest';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { ReauthGuard } from '../auth/guards/reauth.guard';
import { AbuseSecurityController } from './abuse-security.controller';

function guardsOn(method: keyof AbuseSecurityController): unknown[] {
  return (
    (Reflect.getMetadata(
      GUARDS_METADATA,
      AbuseSecurityController.prototype[method],
    ) as unknown[]) ?? []
  );
}

describe('AbuseSecurityController sensitive mutation guards', () => {
  it.each(['blockAddress', 'liftAddress', 'suspendMember'] as const)(
    'requires CSRF and recent reauthentication for %s',
    (method) => {
      const guards = guardsOn(method);
      expect(guards).toContain(CsrfGuard);
      expect(guards).toContain(ReauthGuard);
    },
  );
});
