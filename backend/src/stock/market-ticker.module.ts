import { Inject, Injectable, Logger, Module, Optional } from '@nestjs/common';
import type { OnApplicationBootstrap, OnApplicationShutdown } from '@nestjs/common';
import { StockModule } from './stock.module';
import { StockAlertRepository } from './stock-alert.repository';
import { StockService } from './stock.service';
import { MarketTicker } from './market-ticker';
import { MarketBroadcast } from './market-broadcast';
import { isMarketTickerEnabled } from './market-ticker.config';
import { DiscordAlertService } from '../discord/discord-alert.service';

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
      inject: [StockService, MarketBroadcast, StockAlertRepository, DiscordAlertService],
      useFactory: (
        stocks: StockService | null,
        broadcast: MarketBroadcast,
        alerts: StockAlertRepository | null,
        discordAlert?: DiscordAlertService,
      ): MarketTicker | null => {
        if (!isMarketTickerEnabled() || !stocks) return null;

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
            const live = await stocks.livePrices();
            if (broadcast.shouldPublish) broadcast.publish(live);

            // 실시간 주식 급등락(±15% 이상) 디스코드 커뮤니티 웹훅 브로드캐스트
            if (moved > 0 && discordAlert && live.length > 0) {
              try {
                const stockList = await stocks.list().catch(() => []);
                const stockMap = new Map(stockList.map((s) => [s.id, s]));
                for (const p of live) {
                  const open = Number(p.day_open_price);
                  const cur = Number(p.current_price);
                  if (open > 0) {
                    const changePct = ((cur - open) / open) * 100;
                    if (Math.abs(changePct) >= 15) {
                      const matched = stockMap.get(p.id);
                      if (matched) {
                        discordAlert.broadcastStockMarketMover({
                          symbol: matched.symbol,
                          name: matched.name,
                          currentPrice: cur,
                          changeRatePercent: changePct,
                          reason: changePct >= 30 ? '일일 가격제한폭(상한가) 근접 급등세' : changePct <= -30 ? '일일 가격제한폭(하한가) 근접 급락세' : '실시간 대규모 매매 호가 쏠림',
                        }).catch(() => {});
                      }
                    }
                  }
                }
              } catch {
                // non-blocking
              }
            }

            return moved;
          },
          intervalMs: Number.isFinite(configured) && configured >= 200 ? configured : 1000,
          getIntervalMs: () => {
            const baseInterval = Number.isFinite(configured) && configured >= 200 ? configured : 1000;
            return broadcast.shouldPublish ? baseInterval : Math.max(baseInterval, 3000);
          },
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

