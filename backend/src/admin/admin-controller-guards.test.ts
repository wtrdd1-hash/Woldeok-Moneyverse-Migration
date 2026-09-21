import { GUARDS_METADATA } from '@nestjs/common/constants';
import { describe, expect, it } from 'vitest';
import { AdminSessionGuard } from '../auth/guards/admin-session.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { ReauthGuard } from '../auth/guards/reauth.guard';
import { AdminController } from './admin.controller';

function guardsOn(method: keyof AdminController): unknown[] {
  return (
    (Reflect.getMetadata(GUARDS_METADATA, AdminController.prototype[method]) as unknown[]) ?? []
  );
}

describe('AdminController sensitive mutation guards', () => {
  it('requires an admin session, CSRF, and recent reauthentication to change a member restriction', () => {
    const guards = guardsOn('restrict');
    expect(guards).toContain(AdminSessionGuard);
    expect(guards).toContain(CsrfGuard);
    expect(guards).toContain(ReauthGuard);
  });
});
