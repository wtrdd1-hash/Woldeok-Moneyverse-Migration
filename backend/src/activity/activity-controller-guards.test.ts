import { GUARDS_METADATA } from '@nestjs/common/constants';
import { describe, expect, it } from 'vitest';
import { AdminGuard } from '../auth/guards/admin.guard';
import { AdminSessionGuard } from '../auth/guards/admin-session.guard';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ConsentGuard } from '../auth/guards/consent.guard';
import { SessionGuard } from '../auth/guards/session.guard';
import { ActivityController } from './activity.controller';

describe('ActivityController admin log guards', () => {
  it('hydrates the session before checking consent and administrator access', () => {
    const guards = (Reflect.getMetadata(
      GUARDS_METADATA,
      ActivityController.prototype.listLogs,
    ) as unknown[]) ?? [];

    expect(guards).toEqual([
      SessionGuard,
      AuthenticatedGuard,
      ConsentGuard,
      AdminGuard,
      AdminSessionGuard,
    ]);
  });
});
