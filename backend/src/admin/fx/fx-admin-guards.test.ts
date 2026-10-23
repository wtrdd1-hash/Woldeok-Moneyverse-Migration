import 'reflect-metadata';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { describe, expect, it } from 'vitest';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { AdminSessionGuard } from '../../auth/guards/admin-session.guard';
import { CsrfGuard } from '../../auth/guards/csrf.guard';
import { AdminFxController, PublicFxController } from './fx.controller';

const adminGuards = (): unknown[] =>
  (Reflect.getMetadata(GUARDS_METADATA, AdminFxController) as unknown[]) ?? [];

const publicGuards = (): unknown[] =>
  (Reflect.getMetadata(GUARDS_METADATA, PublicFxController) as unknown[]) ?? [];

describe('FX control tower authorization', () => {
  it('requires admin role, an open elevated console session and CSRF on admin FX routes', () => {
    expect(adminGuards()).toEqual(expect.arrayContaining([AdminGuard, AdminSessionGuard, CsrfGuard]));
  });

  it('does not apply admin-only guards to public FX routes', () => {
    expect(publicGuards()).not.toContain(AdminGuard);
    expect(publicGuards()).not.toContain(AdminSessionGuard);
  });
});
