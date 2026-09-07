# Virtual Stocks

The stock market is an in-service virtual market driven by PostgreSQL-backed price history, member portfolios and bounded market dynamics.

## Main concepts

- virtual stock catalog;
- current prices and historical candles;
- member buy/sell flows;
- portfolio value;
- market events/dynamics;
- ledger-backed WLD settlement.

## Price dynamics

Market dynamics are intentionally bounded. Parameters such as base volatility and intraday movement limits prevent an unbounded random walk from becoming an accidental infinite-value generator.

Live market tuning must be treated as economy policy, not a harmless frontend constant.

## Exact values

Share counts may be normal integer quantities, but WLD price/cost/proceeds must preserve exact integer representation. UI chart percentages can use bounded numeric calculations; underlying money values must not.

## Write boundary

Buy/sell operations should be database-authoritative and atomically validate inventory, available WLD and ledger settlement.

## Related surfaces

- stock market page and candles;
- wallet history;
- progression/quest objectives that reference market activity.
