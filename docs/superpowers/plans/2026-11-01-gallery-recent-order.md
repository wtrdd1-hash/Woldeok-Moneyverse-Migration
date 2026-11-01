# Gallery recent-publication order — bounded design and implementation plan

Status: automated owner-authorized P1 implementation proposal, release HOLD until verified.

## User intent and scope
Let visitors sort the **most recent 24 approved public gallery photos** by publication time, newest or oldest within that same 24-photo window. Never claim all-time oldest. No private uploads, no direct photo table reads, no WLD, no migrations, no new privileges. Preserve default response for existing consumers. Public web and Android must agree; reject duplicate/unknown query values and unverifiable sorted HTTP 200 responses.

## Alternatives and choice
Client-only sort is insufficient for Android API contract; new SQL migration is unnecessary because the existing SECURITY DEFINER function supplies the approved 24. Chosen: service sorts normalized approved read results, Nest controllers validate query, Next gallery exposes GET sort, Android proxy verifies shape/order. No new SQL function or financial changes.

## Implementation stages (test first for each)
1. Add Backend controller/service tests: default unchanged; oldest asc within latest 24; reject invalid/duplicate sort; no extra DB queries. Run RED; implement; run GREEN.
2. Add web tests for accessible sort selection and truthful 24-photo scope; run RED; implement; run GREEN.
3. Add Android app-api tests: reject invalid/duplicate query and unsorted/malformed 200; verify cache/noindex on filtered results; run RED; implement; run GREEN.
4. Verify real PostgreSQL read-only function, ACL and source ordering. Run target, lint, typecheck, build, contract, broader suites with resource limits; recheck main mid/final. Hold PR and deployment if any gate lacks evidence.
5. Record exact SHA, branch/PR counts, CI, Test/Production provenance, rollback (revert candidate; no DB rollback), protected branches and release HOLD.
