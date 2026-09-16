import { GUARDS_METADATA } from '@nestjs/common/constants';
import { describe, expect, it } from 'vitest';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { AdminSecurityController } from './admin-security.controller';

function guardsOn(method: keyof AdminSecurityController): unknown[] {
  return (
    (Reflect.getMetadata(
      GUARDS_METADATA,
      AdminSecurityController.prototype[method],
    ) as unknown[]) ?? []
  );
}

describe('AdminSecurityController console-entry guards', () => {
  it('opens the console from a current admin session without OAuth or TOTP step-up', () => {
    const guards = guardsOn('openConsole');
    expect(guards).toContain(CsrfGuard);
  });
});
