import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import type { Queryable } from '../core/db';
import { PG_POOL } from '../core/pool.provider';
import { WalletController } from './wallet.controller';
import { PostgresWalletRepository } from './wallet.repository';
import { WalletService } from './wallet.service';

@Module({
  imports: [AuthModule],
  controllers: [WalletController],
  providers: [
    {
      // Null with no DATABASE_URL, so the controller answers 503 rather than
      // crashing. WalletService is the only application-facing path for
      // player economy writes; its repository calls the narrowly granted
      // database commands, never raw ledger DML.
      provide: WalletService,
      inject: [PG_POOL],
      useFactory: (pool: Queryable | null) =>
        pool ? new WalletService(new PostgresWalletRepository(pool)) : null,
    },
  ],
  exports: [WalletService],
})
export class WalletModule {}
