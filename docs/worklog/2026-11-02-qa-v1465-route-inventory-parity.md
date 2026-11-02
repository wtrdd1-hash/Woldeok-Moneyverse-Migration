# QA v1465 — Route inventory source parity (DRAFT / RELEASE HOLD)

## Before work — 2026-11-02 15:18 KST
- Source: `origin/main` `a8541927c3a351d980454c66e95a3356c47e0722`; independent branch `qa/v1465-route-inventory-parity`.
- Existing full-route inventory contains 166 pages; source generator returns 173 pages. Seven routes omitted. The current ledger evidence file is absent; **this change does not invent browser passes**.
- Scope: add a deterministic test that compares the committed inventory against source-generated route names, metadata and canonical SHA, then regenerate the inventory. No runtime API, financial code, SQL, grants or deployment changes.
- Planned TDD: baseline RED -> regenerate -> GREEN -> policy suite -> latest-main sync -> Draft PR. Full authenticated route E2E, official Test exact-SHA and production promotion remain BLOCKED.

## In progress
- Pending RED/GREEN evidence.

## Finished
- Pending independent verification and release-gate audit.

### TDD and verification — 2026-11-02 15:18–15:20 KST
- RED: new committed-inventory parity assertion failed on baseline `routeCount` (166 vs source 173), exit 1. Evidence: `qa1465-evidence/route-parity-red.log`.
- GREEN: regenerated committed inventory from source: 173 routes, 36 admin, 33 dynamic, SHA `8e54bed383e8dfdd658a8e110f0035d27b9c3129ba35c5347c22dff0a48aa140`; 8/8 route-ledger unit tests PASS, exit 0.
- Changed-file ESLint PASS, `git diff --check` PASS. Entire `scripts/qa/*.test.mjs` **23 PASS / 1 FAIL** due to pre-existing `ui-backend-truth.v629` simulation wording expectation, independently tracked in Draft #2398; this change does not alter the failing test.
- No browser E2E evidence was produced; `artifacts/qa/full-route-ledger.json` remains absent. The new guard prevents stale inventory from being silently treated as complete; it does not certify 5-pass coverage.

## Finished — source-level change only / RELEASE HOLD
- Source-only parity assertion and regenerated inventory. No API, SQL, grants, money, live server, Test or Production changes.
- Exact-candidate CI, official Test authenticated 5-pass route ledger and GitOps approvals are mandatory before merge/release; no bypass.
- Shared `main` and all collaborator worktrees/branches preserved.
