import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { AuthModule } from '../auth/auth.module';
import type { Queryable } from '../core/db';
import { PG_POOL } from '../core/pool.provider';
import { MarketplaceController } from './marketplace.controller';
import { MarketplaceService } from './marketplace.service';
import { AuctionGateway } from './auction.gateway';
import { BlackMarketController } from './black-market.controller';
import { BlackMarketRepository } from './black-market.repository';

@Module({
  imports: [AuthModule],
  controllers: [MarketplaceController, BlackMarketController],
  providers: [
    MarketplaceService,
    AuctionGateway,
    {
      provide: BlackMarketRepository,
      inject: [PG_POOL],
      useFactory: (pool: Queryable | null) => (pool ? new BlackMarketRepository(pool) : null),
    },
  ],
  exports: [MarketplaceService, AuctionGateway, BlackMarketRepository],
})
export class MarketplaceModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    const owner = [
      'marketplace/my-listings',
      'marketplace/listings/:id/buy',
      'marketplace/listings/:id/cancel',
      'marketplace/auctions/:id/bid',
      'marketplace/trades',
      'marketplace/trades/:id/accept',
      'marketplace/trades/:id/confirm',
      'marketplace/trades/:id/cancel',
      'marketplace/appraisals',
    ];
    consumer
      .apply((_req: Request, res: Response, next: NextFunction) => {
        res.setHeader('Cache-Control', 'private, no-store');
        res.setHeader('X-Robots-Tag', 'noindex');
        res.setHeader('Referrer-Policy', 'no-referrer');
        next();
      })
      .forRoutes(
        ...owner.map((path) => ({ path, method: RequestMethod.ALL })),
        ...['marketplace/listings', 'marketplace/auctions'].map((path) => ({
          path,
          method: RequestMethod.POST,
        })),
      );
  }
}
