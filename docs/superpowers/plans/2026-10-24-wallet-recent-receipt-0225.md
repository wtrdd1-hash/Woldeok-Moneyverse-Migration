# Recent WLD receipt — isolated implementation plan

Canonical: English. Korean worklog/release may accompany the final report.

## Scope and alternatives
Existing `GET /api/v1/wallet?recent=50` already reads an owner-filtered, balanced WLD projection. Rather than invent a new unreviewed SECURITY DEFINER migration or expose a public receipt lookup, add an authenticated `GET /api/v1/wallet/activity/:transactionId` backed by that **same bounded 50-row owner query**. Missing, old and other-owner IDs all return the same 404. No arbitrary user selector, no writes, no claimed lifetime receipt coverage. A future cursor + function will be a separate reviewed change.

## Implementation
1. RED backend unit tests: UUID validation, actor passed into repository, exact 38-digit strings, zero-net pocket movement, unknown/other-owner indistinguishable, no balance lookup; then GREEN service and controller.
2. RED frontend helper and Android gateway tests: canonical signed strings, nonfabricated pocket values, private no-store response, same-origin cookie and no cross-user cache; then GREEN page and bounded activity link.
3. Verify owner ledger SQL still filters account owner; no migration or new direct grants.
4. Run focused and full lint/typecheck/unit/build/audit/real PostgreSQL tests, capture exact SHA and CI; do not merge on any failure.
5. Recheck main, planning and all active PRs before final integration. No Test/Production release until official exact-SHA gates.

## Acceptance
- Receipt is for the signed-in member's latest 50 ledger transactions only.
- WLD amounts remain canonical strings and per-pocket totals reconcile; absent provenance never becomes zero.
- A missing, malformed, old or other-member reference does not reveal another member's transaction.
- Private cache headers and noindex prevent receipt indexing or cross-session caching.
- Real PostgreSQL authorization and E2E are required for release, not replaced by mocks.
