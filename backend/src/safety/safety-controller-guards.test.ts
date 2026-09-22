import 'reflect-metadata';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { describe, expect, it } from 'vitest';
import { AdminSessionGuard } from '../auth/guards/admin-session.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { ReauthGuard } from '../auth/guards/reauth.guard';
import { SafetyController } from './safety.controller';

describe('SafetyController guard boundaries', () => {
  it('requires an admin session, CSRF protection, and recent reauthentication for emergency takedown actions', () => {
    const descriptor = Object.getOwnPropertyDescriptor(SafetyController.prototype, 'adminActionTakedown');
    const guards = Reflect.getMetadata(GUARDS_METADATA, descriptor?.value as object) as unknown[];

    expect(guards).toContain(AdminSessionGuard);
    expect(guards).toContain(CsrfGuard);
    expect(guards).toContain(ReauthGuard);
  });
});
