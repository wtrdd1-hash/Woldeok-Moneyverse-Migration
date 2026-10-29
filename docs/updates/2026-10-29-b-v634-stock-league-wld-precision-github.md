## Backend B v634 — Fail closed on imprecise stock league WLD values

**P1 financial read integrity / Draft HOLD.** Prevent silent rounding of PostgreSQL NUMERIC monetary values beyond JS safe integers across season, leaderboard, whales, member participation and copy subscriptions. Return HTTP 503 (`STOCK_LEAGUE_WLD_PRECISION_UNAVAILABLE`) instead of a fabricated rounded amount. Preserve existing safe-number API responses, auth and ledger behavior. No DB migration or money movement.

TDD RED 4 / GREEN 5; repository regression 16 PASS; real NestJS HTTP 2 PASS; isolated PG17 read-only-role 1 PASS. Full gates and CI evidence in PR. This is a containment, not a complete big-integer API migration. Release remains HOLD until security audit, exact-head CI, isolated Test and authenticated E2E pass.

**Frontend integration HOLD:** `stocks-league-client.tsx` still uses fictional `defaultWhales` and a seeded subscription on API failure. Coordinate with C via issue #1169; closed/unmerged C PR #1168 has not landed in current main. Do not claim end-to-end truthfulness from this backend-only guard.
