import { GUARDS_METADATA } from '@nestjs/common/constants';
import { describe, expect, it } from 'vitest';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { ReauthGuard } from '../auth/guards/reauth.guard';
import { SecondFactorGuard } from '../auth/guards/second-factor.guard';
import { AdminEconomyController } from './economy.controller';

/**
 * The control centre's three levers retain CSRF while relying on the active
 * administrator console and database role checks. Read from decorator metadata
 * writes, so the assertion is about the route as Nest will build it and not
 * about a string in the source.
 */
function guardsOn(method: keyof AdminEconomyController): unknown[] {
  return (Reflect.getMetadata(GUARDS_METADATA, AdminEconomyController.prototype[method]) as unknown[]) ?? [];
}

describe('AdminEconomyController mutation guards', () => {
  it.each(['toggleKillswitch', 'updateKnobsV2', 'overrideUserV2'] as const)(
    'requires CSRF without additional authentication on %s',
    (method) => {
      const guards = guardsOn(method);
      expect(guards).toContain(CsrfGuard);
      expect(guards).not.toContain(ReauthGuard);
      expect(guards).not.toContain(SecondFactorGuard);
    },
  );
});
