# P1 public active market-event direction filter — A 09:25

## Scope and source

A public visitor wants to distinguish currently active positive and negative virtual-market events without inferred market sentiment, fabricated events, owner data or financial writes. The source is existing PostgreSQL `public.stock_market_events_active()` (migration 124), executed through the app role and the Nest stock repository. The existing unfiltered endpoint must remain compatible.

## Bounded design

1. Add strict optional `direction=up|down` to public Nest `GET /api/v1/stocks/market-events`. Reject duplicate, unknown and empty filters with 400 before repository access.
2. Apply the filter as a parameterized predicate on the SECURITY DEFINER function projection, not by granting base-table privileges. No migration or financial transaction.
3. Add `/newspaper/events` with All/Up/Down navigation, explicit evidence-backed empty vs unavailable, source and expiry, accessible focusable links and no financial advice. Link from existing newspaper.
4. Android `/app-api/v1/stocks/market-events?direction=` rejects invalid/duplicate filters before fetch and fails closed on a legacy unfiltered HTTP 200. Preserve the legacy unfiltered contract.
5. RED-GREEN tests: controller/SQL/HTTP, Next parser/page, Android gateway; PostgreSQL read-only role proof; contract, typecheck, lint, build, security and full suites. Release only after exact-SHA official Test, baseline suite repairs, DB ACL and release provenance gates.

## Rollback

Revert the feature commit or hide the public link and reject optional direction until a corrected candidate is validated. Existing unfiltered endpoint and migration 124 remain unchanged. No data rollback, ledger mutation or grant is required.
