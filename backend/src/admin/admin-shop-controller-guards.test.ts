import 'reflect-metadata';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { describe, expect, it } from 'vitest';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { ReauthGuard } from '../auth/guards/reauth.guard';
import { AdminShopController } from './admin-shop.controller';

function guardsOn(method: keyof AdminShopController): unknown[] {
  return (
    (Reflect.getMetadata(GUARDS_METADATA, AdminShopController.prototype[method]) as unknown[]) ?? []
  );
}

describe('AdminShopController privileged mutation guards', () => {
  it('requires CSRF and recent reauthentication to change catalog economics', () => {
    const guards = guardsOn('updateItem');
    expect(guards).toContain(CsrfGuard);
    expect(guards).toContain(ReauthGuard);
  });
});
