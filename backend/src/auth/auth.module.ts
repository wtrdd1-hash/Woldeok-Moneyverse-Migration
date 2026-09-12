import { Module, forwardRef } from '@nestjs/common';
import type { Queryable } from '../core/db';
import { PG_POOL } from '../core/pool.provider';
import { EncryptionService } from '../security/encryption.service';
import { AdminRolesRepository } from './admin-roles.repository';
import { AdminGuard } from './guards/admin.guard';
import { AdminSessionGuard } from './guards/admin-session.guard';
import { AuthenticatedGuard } from './guards/authenticated.guard';
import { ConsentGuard } from './guards/consent.guard';
import { CsrfGuard } from './guards/csrf.guard';
import { InternalTokenGuard } from './guards/internal-token.guard';
import { ReauthGuard } from './guards/reauth.guard';
import { SecondFactorGuard } from './guards/second-factor.guard';
import { SessionGuard } from './guards/session.guard';
import { AccountModule } from '../account/account.module';
import { AuthBootstrapController } from './bootstrap.controller';
import { AuthController } from './auth.controller';
import { LocalAuthController } from './local-auth.controller';
import { LocalAuthRepository } from './local-auth.repository';
import { OAuthClient } from './oauth-client';
import { SecondFactorRepository } from './second-factor.repository';
import { SessionRepository } from './session.repository';

const GUARDS = [
  SessionGuard,
  AuthenticatedGuard,
  ConsentGuard,
  CsrfGuard,
  AdminGuard,
  AdminSessionGuard,
  ReauthGuard,
  SecondFactorGuard,
  InternalTokenGuard,
];

@Module({
  imports: [forwardRef(() => AccountModule)],
  controllers: [AuthController, AuthBootstrapController, LocalAuthController],
  providers: [
    {
      provide: OAuthClient,
      useFactory: () => new OAuthClient(),
    },
    {
      provide: SessionRepository,
      inject: [PG_POOL, EncryptionService],
      useFactory: (pool: Queryable | null, encryption: EncryptionService) =>
        pool ? new SessionRepository(pool, encryption) : null,
    },
    {
      provide: LocalAuthRepository,
      inject: [PG_POOL],
      useFactory: (pool: Queryable | null) => (pool ? new LocalAuthRepository(pool) : null),
    },
    {
      provide: SecondFactorRepository,
      inject: [PG_POOL],
      useFactory: (pool: Queryable | null) => (pool ? new SecondFactorRepository(pool) : null),
    },
    AdminRolesRepository,
    ...GUARDS,
  ],
  exports: [
    SessionRepository,
    LocalAuthRepository,
    SecondFactorRepository,
    AdminRolesRepository,
    OAuthClient,
    ...GUARDS,
  ],
})
export class AuthModule {}
