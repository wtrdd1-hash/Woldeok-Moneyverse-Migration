# Verified administrator blog refresh — implementation plan

**Goal:** Stop falsely reporting a successful admin blog sync; refresh DB-verified publications through the existing elevated-session Nest contract without changing unrelated legacy records.

**Architecture:** New guarded Next route `frontend/src/app/api/admin/blog/verified-refresh/route.ts` uses `currentViewer/isAdministrator`, `api('/api/v1/admin/blog-verified')`, and existing `verifiedArticlesForAdmin` projection; strict all-or-nothing cardinality and privacy headers. Client refresh requests this route with no-store, validates response envelope and replaces verified posts only; stale legacy posts are explicitly outside refresh scope.

**Task 1 — RED:** Write `verified-refresh/route.test.ts` for denied/unavailable/malformed/valid/empty and privacy. Run and observe failure.

**Task 2 — GREEN:** Implement BFF with bounded response validation and no credential leakage. Run focused tests.

**Task 3 — RED:** Add client interaction tests: no fake success, server failure preserved state, valid response replaces verified entries without changing legacy, keyboard feedback. Run and observe failure.

**Task 4 — GREEN:** Replace timer-based `router.refresh` success with actual verified fetch and accessible status. Run focused tests.

**Task 5 — Verify:** Re-fetch main/plans; run lint/typecheck/build/frontend/backend/contract/security/DB/integration/E2E as available; record all blockers; create Draft PR and preserve all work; no merge/deploy without complete gates.
