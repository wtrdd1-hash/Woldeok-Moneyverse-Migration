# Auction bid/source truth — bounded implementation plan

1. Add RED regression tests for no seeded auctions, server error != successful escrow, invalid source != empty, and backend bid 503 without service invocation.
2. Remove simulated auction data and optimistic receipt path. Parse authoritative auction list defensively, expose loading/empty/error and retry, retain 320px responsive and keyboard/screen-reader affordances.
3. Fail close Nest auction bid before any money/expiry/proxy mutation. Keep endpoint and DTO contract for future verified settlement.
4. Run focused tests, lint, typecheck, builds and other available exact-SHA gates; record failures honestly, no Production promotion without full gates.
