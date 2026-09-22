import { GUARDS_METADATA } from '@nestjs/common/constants';
import { describe, expect, it } from 'vitest';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { ReauthGuard } from '../auth/guards/reauth.guard';
import { AdminAuditController } from './audit.controller';

function guardsOn(method: keyof AdminAuditController): unknown[] {
  return (Reflect.getMetadata(GUARDS_METADATA, AdminAuditController.prototype[method]) as unknown[]) ?? [];
}

describe('AdminAuditController privileged mutation guards', () => {
  it.each(['reveal', 'setRetention', 'recordDisposition'] as const)(
    'requires recent reauthentication for %s',
    (method) => {
      expect(guardsOn(method)).toEqual(expect.arrayContaining([CsrfGuard, ReauthGuard]));
    },
  );

  it('does not require step-up for integrity verification', () => {
    expect(guardsOn('verify')).toContain(CsrfGuard);
    expect(guardsOn('verify')).not.toContain(ReauthGuard);
  });
});
