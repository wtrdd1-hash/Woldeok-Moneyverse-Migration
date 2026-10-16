import { GUARDS_METADATA } from '@nestjs/common/constants';
import { describe, expect, it } from 'vitest';
import { AdminSessionGuard } from '../../auth/guards/admin-session.guard';
import { CsrfGuard } from '../../auth/guards/csrf.guard';
import { ReauthGuard } from '../../auth/guards/reauth.guard';
import { MonetaryController } from './monetary.controller';

function classGuards(): unknown[] {
  return (Reflect.getMetadata(GUARDS_METADATA, MonetaryController) as unknown[]) ?? [];
}
function methodGuards(method: keyof MonetaryController): unknown[] {
  return (
    (Reflect.getMetadata(GUARDS_METADATA, MonetaryController.prototype[method]) as unknown[]) ?? []
  );
}

describe('v722 monetary operator security perimeter', () => {
  it('requires elevated admin console and CSRF on every monetary HTTP mutation', () => {
    const guards = classGuards();
    expect(guards).toContain(AdminSessionGuard);
    expect(guards).toContain(CsrfGuard);
  });

  it('requires fresh reauthentication for mint, order approval and unfreeze', () => {
    for (const method of [
      'executeMint',
      'approveOrder',
      'unfreeze',
      'runAutoRegulationManually',
    ] as const) {
      expect(methodGuards(method), method).toContain(ReauthGuard);
    }
  });
});
