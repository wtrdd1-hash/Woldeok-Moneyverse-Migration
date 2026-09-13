import { Inject, Injectable, Logger, Module } from '@nestjs/common';
import type { OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { StockModule } from './stock.module';
import { StockAlertRepository } from './stock-alert.repository';
import { StockService } from './stock.service';
import { MarketTicker } from './market-ticker';
import { MarketBroadcast } from './market-broadcast';

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
    MarketBroadcast,
    {
      provide: MARKET_TICKER,
      inject: [StockService, MarketBroadcast, StockAlertRepository],
      useFactory: (
        stocks: StockService | null,
        broadcast: MarketBroadcast,
        alerts: StockAlertRepository | null,
      ): MarketTicker | null => {
        if (process.env.MARKET_TICKER_ENABLED !== 'true' || !stocks) return null;

        const configured = Number(process.env.MARKET_TICK_INTERVAL_MS ?? 1000);
        const logger = new Logger('MarketTicker');
        return new MarketTicker({
          tick: async () => {
            const moved = await stocks.liveTick();
            if (moved > 0 && alerts) {
              try {
                const triggered = await alerts.evaluateDue();
                if (triggered > 0) logger.log(`triggered ${triggered} stock alert event(s)`);
              } catch (error: unknown) {
                logger.warn(`stock alert evaluation failed: ${error instanceof Error ? error.message : String(error)}`);
              }
            }
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
