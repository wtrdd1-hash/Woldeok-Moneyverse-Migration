# SWF governance service fail-closed plan (B v531)

## Design
The SWF policy update method issues direct DML and an unverified, best-effort audit event. A protected HTTP route alone cannot secure direct internal calls. Until a reviewed owner-authorized, atomic database function, idempotent receipt and exact-SHA Test exist, reject writes with HTTP 503 before any query. This intentionally pauses SWF policy editing; it does not implement governance settlement.

## RED / GREEN / REFACTOR
1. Add service-level tests for policy update with runtime flags both off and on; assert `ServiceUnavailableException` status 503 and `SWF_GOVERNANCE_WRITE_UNAVAILABLE`, with zero pool queries and zero notification side effects.
2. Run RED tests on pristine main; remove direct update and best-effort audit path, implement minimal unconditional service guard.
3. Re-run focused tests and full feasible checks. Refresh main/EN+KO plan, record blocked real-PG/official-Test/security gates, publish Draft PR. Preserve other unmerged SWF changes.

## Contract
Existing `PUT /api/v1/admin/treasury/swf/config` route and request schema unchanged. A direct `updateConfig` invocation always raises HTTP 503 with code `SWF_GOVERNANCE_WRITE_UNAVAILABLE`. Read-only SWF status remains available. No schema, ledger, or migration changes.
