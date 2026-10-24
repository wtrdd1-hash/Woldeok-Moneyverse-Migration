import { GUARDS_METADATA } from '@nestjs/common/constants';
import { describe, expect, it } from 'vitest';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminSessionGuard } from '../auth/guards/admin-session.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { ReauthGuard } from '../auth/guards/reauth.guard';
import { CentralBankController } from './central-bank.controller';
import { MintController } from '../mint/mint.controller';

function guardsOn(controller: { prototype: object }, method?: string): unknown[] {
  const classGuards = (Reflect.getMetadata(GUARDS_METADATA, controller) as unknown[]) ?? [];
  const methodGuards = method
    ? (Reflect.getMetadata(GUARDS_METADATA, (controller.prototype as Record<string, object>)[method]) as unknown[]) ?? []
    : [];
  return [...classGuards, ...methodGuards];
}

describe('central bank and mint administrative command boundary', () => {
  it.each(['acceptMintBatch', 'updateBaseRate', 'updateReserveRequirement'])(
    'requires an open admin console, CSRF, and recent reauthentication for %s',
    (method) => {
      const guards = guardsOn(CentralBankController, method);
      expect(guards).toContain(AdminGuard);
      expect(guards).toContain(AdminSessionGuard);
      expect(guards).toContain(CsrfGuard);
      expect(guards).toContain(ReauthGuard);
    },
  );

  it.each(['createMintBatch', 'burnCurrency'])(
    'requires an open admin console, CSRF, and recent reauthentication for %s',
    (method) => {
      const guards = guardsOn(MintController, method);
      expect(guards).toContain(AdminGuard);
      expect(guards).toContain(AdminSessionGuard);
      expect(guards).toContain(CsrfGuard);
      expect(guards).toContain(ReauthGuard);
    },
  );

  it('does not require an admin console for member monetary aggregate reads', () => {
    expect(guardsOn(CentralBankController, 'getMonetaryAggregates')).not.toContain(AdminSessionGuard);
  });
});
