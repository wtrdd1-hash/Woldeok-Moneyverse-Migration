import { GUARDS_METADATA } from '@nestjs/common/constants';
import { describe, expect, it } from 'vitest';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { ReauthGuard } from '../auth/guards/reauth.guard';
import { GameCatalogController } from './game-catalog.controller';

function guardsOn(method: keyof GameCatalogController): unknown[] {
  return (
    (Reflect.getMetadata(
      GUARDS_METADATA,
      GameCatalogController.prototype[method],
    ) as unknown[]) ?? []
  );
}

describe('GameCatalogController mutation guards', () => {
  it.each(['setStockPrice', 'haltStock', 'retryHaltSettlement', 'corporateAction'] as const)(
    'requires CSRF and recent reauthentication on %s',
    (method) => {
      const guards = guardsOn(method);
      expect(guards).toContain(CsrfGuard);
      expect(guards).toContain(ReauthGuard);
    },
  );

  it('keeps deletion of an untraded stock behind CSRF without requiring a code', () => {
    const guards = guardsOn('deleteStock');
    expect(guards).toContain(CsrfGuard);
    expect(guards).not.toContain(ReauthGuard);
  });
});
