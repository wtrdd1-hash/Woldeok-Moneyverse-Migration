import { Module } from '@nestjs/common';
import type { Queryable } from '../core/db';
import { PG_POOL } from '../core/pool.provider';
import { AdminRolesRepository } from './admin-roles.repository';
import { AdminGuard } from './guards/admin.guard';
import { AuthenticatedGuard } from './guards/authenticated.guard';
import { ConsentGuard } from './guards/consent.guard';
import { CsrfGuard } from './guards/csrf.guard';
import { InternalTokenGuard } from './guards/internal-token.guard';
import { ReauthGuard } from './guards/reauth.guard';
import { SessionGuard } from './guards/session.guard';
import { SessionRepository } from './session.repository';

const GUARDS = [
  SessionGuard,
  AuthenticatedGuard,
  ConsentGuard,
  CsrfGuard,
  AdminGuard,
  ReauthGuard,
  InternalTokenGuard,
];

@Module({
  providers: [
    {
      provide: SessionRepository,
      inject: [PG_POOL],
      useFactory: (pool: Queryable | null) => (pool ? new SessionRepository(pool) : null),
    },
    AdminRolesRepository,
    ...GUARDS,
  ],
  exports: [SessionRepository, AdminRolesRepository, ...GUARDS],
})
export class AuthModule {}
