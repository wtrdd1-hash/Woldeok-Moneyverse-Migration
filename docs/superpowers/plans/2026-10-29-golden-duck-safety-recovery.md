# Golden Duck reward safety recovery — B v625

## Context and design
P0 #1319: a client-provided tap count can mint via a non-atomic check-then-post; a null repository fabricates a successful WLD receipt. Re-enable neither path without an authoritative migration-owned atomic daily settlement, immutable idempotency, owner scope and real PostgreSQL concurrency proof. Existing closed A #1320 provides an earlier unmerged reference; recover unique safety changes, not unrelated edits.

## Tasks
1. RED: tests prove controller cannot claim when repo missing or present; direct repository cannot mint; frontend cannot call claim or publish wallet event.
2. GREEN: fail closed at controller and repository; make frontend 10-second game local practice only and remove claim action. Preserve read-only engagement functionality.
3. Verify focused backend and frontend tests, build/typecheck/lint, API contract and security checks. Do not touch database or deployed services.
4. Push draft/hold PR; record missing exact-SHA Test, real PG, CI and release status.
