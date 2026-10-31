# B v696 — Public FX read boundary (Draft / HOLD)

## Root cause
QA v1420 reproduced official Test `GET /api/v1/fx/portal` HTTP 500: the application role lacks direct SELECT on FX source tables, but the repository queried them directly. Granting table SELECT would violate the least-privilege database boundary.

## Code and database contract
- Forward-only migration `314-fx-public-scoped-read.sql`: four aggregate-only `SECURITY DEFINER` functions with fixed search path, bounded rate history, and `EXECUTE` granted only to `moneyverse_app` (not PUBLIC). Explicitly revoke raw-table access.
- FX repository now reads reserve status, rate history, SDR allocations and swap agreements through those functions; spot-rate lookup uses the scoped reserve. Missing or invalid spot values fail closed with 503 rather than inventing a 1350 rate.
- Existing route paths, public DTO shapes, auth/session policies, financial mutations, ledger and WLD balances are unchanged.
- Tests cover RED/GREEN repository calls, migration ACL policy, and a real PostgreSQL 17.11 application-role boundary.

## Release HOLD / integration dependencies
- **Not a verified live FX market feed.** Migration 255 seeded fictional reference values; source freshness/provenance is not established. Draft #2114 must fail-close public market publication until independently attested.
- Draft #2193 touches the same repository spot fallback. Resolve overlap and re-run all gates before merge.
- Admin FX status still contains member transaction/forward-contract reads outside this public aggregate scope; do not claim the full admin FX screen is repaired.
- Official Test exact-SHA, authenticated E2E, independent restore, complete remote CI and GitOps release proof remain required. No main merge, Test or Production promotion authorized by this Draft.
