import { GUARDS_METADATA } from '@nestjs/common/constants';
import { describe, expect, it } from 'vitest';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { ReauthGuard } from '../auth/guards/reauth.guard';
import { AdminWorkOperationsController } from './operations.controller';

function guardsOn(method: keyof AdminWorkOperationsController): unknown[] {
  return (
    (Reflect.getMetadata(
      GUARDS_METADATA,
      AdminWorkOperationsController.prototype[method],
    ) as unknown[]) ?? []
  );
}

describe('AdminWorkOperationsController mutation guards', () => {
  it.each(['autoTune', 'updatePolicy', 'updateTask'] as const)(
    'requires CSRF and recent reauthentication on %s',
    (method) => {
      const guards = guardsOn(method);
      expect(guards).toContain(CsrfGuard);
      expect(guards).toContain(ReauthGuard);
    },
  );
});
