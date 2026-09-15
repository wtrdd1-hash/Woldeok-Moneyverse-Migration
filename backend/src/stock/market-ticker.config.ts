export interface MarketTickerEnvironment {
  readonly MARKET_TICKER_ENABLED?: string;
  readonly NODE_ENV?: string;
}

/**
 * Production must keep the simulated market moving even when an environment
 * file is missing the ticker flag. Operators can still stop it explicitly by
 * setting MARKET_TICKER_ENABLED=false. Non-production environments remain
 * opt-in so tests and local development do not mutate prices unexpectedly.
 */
export const isMarketTickerEnabled = (
  environment: MarketTickerEnvironment = process.env,
): boolean => {
  if (environment.MARKET_TICKER_ENABLED === 'true') return true;
  if (environment.MARKET_TICKER_ENABLED === 'false') return false;
  return environment.NODE_ENV === 'production';
};
