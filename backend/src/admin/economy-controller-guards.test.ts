import { GUARDS_METADATA } from '@nestjs/common/constants';
import { describe, expect, it } from 'vitest';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { ReauthGuard } from '../auth/guards/reauth.guard';
import { SecondFactorGuard } from '../auth/guards/second-factor.guard';
import { AdminEconomyController } from './economy.controller';

/**
 * The control centre's three levers carry the step-up every other high-risk
 * write in the console does. Read from the decorator metadata `@UseGuards`
 * writes, so the assertion is about the route as Nest will build it and not
 * about a string in the source.
 */
function guardsOn(method: keyof AdminEconomyController): unknown[] {
  return (Reflect.getMetadata(GUARDS_METADATA, AdminEconomyController.prototype[method]) as unknown[]) ?? [];
}

describe('AdminEconomyController step-up guards', () => {
  it.each(['toggleKillswitch', 'updateKnobsV2', 'overrideUserV2'] as const)(
    'requires CSRF, a recent sign-in confirmation and a spent code on %s',
    (method) => {
      const guards = guardsOn(method);
      expect(guards).toContain(CsrfGuard);
      expect(guards).toContain(ReauthGuard);
      expect(guards).toContain(SecondFactorGuard);
    },
  );
});
