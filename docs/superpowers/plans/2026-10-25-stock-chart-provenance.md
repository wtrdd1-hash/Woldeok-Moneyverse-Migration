# Stock chart candle provenance — implementation plan (2026-10-25)

## Goal and constraints
The stock chart must never imply observed trades when the server returned no candle history. Use existing owner-safe Next.js gateway -> NestJS -> PostgreSQL stock_candles. No new DB grants or financial writes. The existing API does not expose volume; do not estimate it.

## Steps (TDD)
1. Add focused React tests for missing stock id, empty API candles, failed API response, valid one/two candles, invalid OHLC, and timeframe change. First observe RED.
2. Implement strict positive safe-integer OHLC validation, timestamps, order, and bounded row counts. Reject malformed responses instead of painting synthetic history. Keep responses keyed by stock id + timeframe to avoid stale render. Preserve real one-candle history and indicator calculations only when enough points exist. No fabricated volume.
3. Render accessible loading/empty/error feedback and measured-data label. Ensure keyboard-visible controls and 44px touch targets, responsive layout, private/no-store gateway and member page noindex. Add gateway regression where necessary.
4. Run focused tests, lint/typecheck, build, unit/integration, contract, security, isolated PostgreSQL and exact-SHA E2E/CI. Record failures truthfully; never merge or deploy on failed gates.
5. Re-fetch main and plans mid-work and before any proposed merge. Protect other branches. Publish English canonical/Korean companion work logs and Draft PR with evidence.
