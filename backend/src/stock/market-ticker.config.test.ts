import { describe, expect, it } from 'vitest';
import { isMarketTickerEnabled } from './market-ticker.config';

describe('isMarketTickerEnabled', () => {
  it('enables the ticker by default in production', () => {
    expect(isMarketTickerEnabled({ NODE_ENV: 'production' })).toBe(true);
  });

  it('keeps non-production environments opt-in', () => {
    expect(isMarketTickerEnabled({ NODE_ENV: 'test' })).toBe(false);
    expect(isMarketTickerEnabled({ NODE_ENV: 'development' })).toBe(false);
  });

  it('honours explicit true and false overrides', () => {
    expect(isMarketTickerEnabled({ NODE_ENV: 'test', MARKET_TICKER_ENABLED: 'true' })).toBe(true);
    expect(isMarketTickerEnabled({ NODE_ENV: 'production', MARKET_TICKER_ENABLED: 'false' })).toBe(false);
  });
});
