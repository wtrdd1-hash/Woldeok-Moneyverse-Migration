import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import type { Queryable } from '../core/db';
import { PG_POOL } from '../core/pool.provider';
import { WalletController } from './wallet.controller';
import { PostgresWalletRepository } from './wallet.repository';
import { WalletService } from './wallet.service';

import { MarketBroadcast } from '../stock/market-broadcast';

@Module({
  imports: [AuthModule],
  controllers: [WalletController],
  providers: [
    {
      provide: WalletService,
      inject: [PG_POOL, { token: MarketBroadcast, optional: true }],
      useFactory: (pool: Queryable | null, broadcast?: MarketBroadcast) =>
        pool ? new WalletService(new PostgresWalletRepository(pool), { broadcast }) : null,
    },
  ],
  exports: [WalletService],
})
export class WalletModule {}
