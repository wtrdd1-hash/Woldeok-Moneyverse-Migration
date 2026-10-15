import 'reflect-metadata';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { describe, expect, it } from 'vitest';
import { AdminSessionGuard } from '../auth/guards/admin-session.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';
import { ReauthGuard } from '../auth/guards/reauth.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { SafetyController } from './safety.controller';

describe('SafetyController guard boundaries', () => {
  it('requires a signed-in admin session, role and CSRF, but no extra identity reauthentication for takedown actions', () => {
    const descriptor = Object.getOwnPropertyDescriptor(SafetyController.prototype, 'adminActionTakedown');
    const guards = Reflect.getMetadata(GUARDS_METADATA, descriptor?.value as object) as unknown[];

    expect(guards).toContain(SessionGuard);
    expect(guards).toContain(AuthenticatedGuard);
    expect(guards).toContain(ConsentGuard);
    expect(guards).toContain(AdminGuard);
    expect(guards).toContain(AdminSessionGuard);
    expect(guards).toContain(CsrfGuard);
    expect(guards).not.toContain(ReauthGuard);
  });
});
