import { Inject, Injectable, Logger, Module } from '@nestjs/common';
import type { OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { StockModule } from './stock.module';
import { StockService } from './stock.service';
import { MarketTicker } from './market-ticker';
import { MarketBroadcast } from './market-broadcast';

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
    // One instance, shared: the bootstrap attaches the socket server to it
    // and the ticker publishes through it. It exists whether or not the
    // ticker does, because a deployment that does not run the market can
    // still be the one a reader is connected to.
    MarketBroadcast,
    {
      provide: MARKET_TICKER,
      inject: [StockService, MarketBroadcast],
      useFactory: (
        stocks: StockService | null,
        broadcast: MarketBroadcast,
      ): MarketTicker | null => {
        if (process.env.MARKET_TICKER_ENABLED !== 'true' || !stocks) return null;

        const configured = Number(process.env.MARKET_TICK_INTERVAL_MS ?? 1000);
        const logger = new Logger('MarketTicker');
        return new MarketTicker({
          tick: async () => {
            const moved = await stocks.liveTick();
            // Read the prices only when somebody is connected to receive
            // them. An idle deployment pays for the walk and nothing else.
            if (broadcast.shouldPublish) broadcast.publish(await stocks.livePrices());
            return moved;
          },
          intervalMs: Number.isFinite(configured) && configured >= 200 ? configured : 1000,
          onError: (error) =>
            logger.warn(error instanceof Error ? error.message : String(error)),
        });
      },
    },
    MarketTickerRunner,
  ],
  exports: [MarketBroadcast],
})
export class MarketTickerModule {}
