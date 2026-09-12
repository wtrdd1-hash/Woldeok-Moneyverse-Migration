import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import type { Queryable } from '../core/db';
import { PG_POOL } from '../core/pool.provider';
import { EncryptionService } from '../security/encryption.service';
import { AccountSecurityController } from './account-security.controller';
import { AccountSecurityRepository } from './account-security.repository';
import { AccountController } from './account.controller';
import { PostgresAccountRepository } from './account.repository';
import { AccountService } from './account.service';

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [AccountController, AccountSecurityController],
  providers: [
    {
      provide: AccountService,
      inject: [PG_POOL, EncryptionService],
      useFactory: (pool: Queryable | null, encryption: EncryptionService) =>
        pool ? new AccountService(new PostgresAccountRepository(pool, encryption)) : null,
    },
    {
      provide: AccountSecurityRepository,
      inject: [PG_POOL],
      useFactory: (pool: Queryable | null) => (pool ? new AccountSecurityRepository(pool) : null),
    },
  ],
  exports: [AccountService],
})
export class AccountModule {}
