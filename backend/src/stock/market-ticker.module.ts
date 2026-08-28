import { Inject, Injectable, Logger, Module } from '@nestjs/common';
import type { OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { StockModule } from './stock.module';
import { StockService } from './stock.service';
import { MarketTicker } from './market-ticker';

/**
 * Runs the market, if this deployment is told to.
 *
 * `MARKET_TICK_INTERVAL_MS` decides the beat and `MARKET_TICKER_ENABLED`
 * decides whether there is one at all. Off by default: a second process
 * ticking the same database would be harmless — the function takes an
 * advisory lock — but a developer's laptop quietly moving the test market is
 * not what anyone wants, and a deployment saying so out loud is cheap.
 */
export const MARKET_TICKER = Symbol('MARKET_TICKER');

@Injectable()
export class MarketTickerRunner implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger('MarketTicker');

  constructor(@Inject(MARKET_TICKER) private readonly ticker: MarketTicker | null) {}

  onApplicationBootstrap(): void {
    if (!this.ticker) {
      this.logger.log('market ticker disabled; prices will not move on their own');
      return;
    }
    this.ticker.start();
    this.logger.log('market ticker running');
  }

  onApplicationShutdown(): void {
    this.ticker?.stop();
  }
}

@Module({
  imports: [StockModule],
  providers: [
    {
      provide: MARKET_TICKER,
      inject: [StockService],
      useFactory: (stocks: StockService | null): MarketTicker | null => {
        if (process.env.MARKET_TICKER_ENABLED !== 'true' || !stocks) return null;

        const configured = Number(process.env.MARKET_TICK_INTERVAL_MS ?? 1000);
        const logger = new Logger('MarketTicker');
        return new MarketTicker({
          tick: () => stocks.liveTick(),
          intervalMs: Number.isFinite(configured) && configured >= 200 ? configured : 1000,
          onError: (error) =>
            logger.warn(error instanceof Error ? error.message : String(error)),
        });
      },
    },
    MarketTickerRunner,
  ],
})
export class MarketTickerModule {}
