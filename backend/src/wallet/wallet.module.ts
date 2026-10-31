import { TelegramAlertService } from '../telegram/telegram-alert.service';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
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
      inject: [PG_POOL, { token: MarketBroadcast, optional: true }, { token: TelegramAlertService, optional: true }],
      useFactory: (pool: Queryable | null, broadcast?: MarketBroadcast, telegramAlert?: TelegramAlertService) =>
        pool ? new WalletService(new PostgresWalletRepository(pool), { broadcast, telegramAlert }) : null,
    },
  ],
  exports: [WalletService],
})
export class WalletModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    // Financial balances, transaction receipts, and reward/bank responses must
    // remain private even when session, consent, or CSRF guards reject early.
    // Method decorators cannot protect a response rejected before its handler.
    consumer.apply((_req: Request, res: Response, next: NextFunction) => {
      res.setHeader('Cache-Control', 'private, no-store');
      res.setHeader('X-Robots-Tag', 'noindex');
      res.setHeader('Referrer-Policy', 'no-referrer');
      next();
    }).forRoutes(WalletController);
  }
}
