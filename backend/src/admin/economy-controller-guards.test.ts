import { GUARDS_METADATA } from '@nestjs/common/constants';
import { describe, expect, it } from 'vitest';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { ReauthGuard } from '../auth/guards/reauth.guard';
import { AdminEconomyController } from './economy.controller';

/**
 * High-risk economic mutations require both CSRF and fresh server-side
 * reauthentication. Read from decorator metadata
 * writes, so the assertion is about the route as Nest will build it and not
 * about a string in the source.
 */
function guardsOn(method: keyof AdminEconomyController): unknown[] {
  return (Reflect.getMetadata(GUARDS_METADATA, AdminEconomyController.prototype[method]) as unknown[]) ?? [];
}

describe('AdminEconomyController mutation guards', () => {
  it.each([
    'executeBulkPayout',
    'reverseTransaction',
    'toggleKillswitch',
    'updateKnobsV2',
    'overrideUserV2',
  ] as const)(
    'requires CSRF and recent reauthentication on %s',
    (method) => {
      const guards = guardsOn(method);
      expect(guards).toContain(CsrfGuard);
      expect(guards).toContain(ReauthGuard);
    },
  );
});
