import { MiddlewareConsumer, Module, NestModule, forwardRef } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
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
export class AccountModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    // Linked login methods and account-deletion receipts are owner-private even
    // when authentication, consent, CSRF or reauthentication rejects a request.
    // Handler @Header decorators do not run for guard failures.
    consumer.apply((_req: Request, res: Response, next: NextFunction) => {
      res.setHeader('Cache-Control', 'private, no-store');
      res.setHeader('X-Robots-Tag', 'noindex');
      res.setHeader('Referrer-Policy', 'no-referrer');
      next();
    }).forRoutes(AccountController);
  }
}
