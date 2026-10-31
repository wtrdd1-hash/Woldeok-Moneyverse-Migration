# B v688 — Bank App API privacy response boundary

Status: IN PROGRESS / DRAFT / RELEASE HOLD.

## Before work
- Baseline origin/main `761a55a094fb9dd383d213e817305e68c79fa23c`; independent worktree and branch `auto/hourly-b-v688-bank-private-edge-20261031-1400`.
- QA v1413 fails audit-full, route-ledger-check, test-gate; Production provenance and exact-SHA Test remain blocked.
- Existing `handle()` sets `Cache-Control: private, no-store` for `bank`/`banking` but does not set `X-Robots-Tag: noindex` or `Referrer-Policy: no-referrer`; upstream may supply `index, follow` or a referrer policy allowing leakage. This is a conditional response-header defect, not evidence of data exposure.
- No change to bank ledger, SQL functions, permissions, migrations or public web banking pages.
- Existing PRs #2145, #2140, #2136 also touch the App API route; preserve all changes and do not merge without integration review.

## Plan
1. Add failing App API tests for bank/banking owner 200, unauthorized 401, upstream 503 and HEAD/204 with hostile upstream headers. Confirm unrelated public route unaffected.
2. Apply a narrow bank/banking privacy header override in the outer handler for all response paths; no changes to API bodies or authorization.
3. Run focused tests, lint/typecheck, frontend/backend builds, relevant package/security tests and isolated PostgreSQL where feasible.
4. Push isolated branch and Draft/HOLD PR, record CI and exact-SHA Test blockers. Never merge/deploy on incomplete gates.

## In progress
- RED-GREEN-REFACTOR and verification evidence pending.

## Finished
- Pending validation.

## In progress — implementation evidence
- RED: six focused tests failed before implementation because `X-Robots-Tag` was absent on bank/banking GET, HEAD, 200, 401, 503 and 204 responses.
- GREEN: all six passed after the narrow `handle()` response-header override; one public stocks route regression was added and passed (7/7 focused).
- Focused App API 59/59 passed, security advisory tests passed, mobile contract 184 endpoints checked, lint exit 0 (1,049 pre-existing warnings), typecheck exit 0, full backend/frontend build exit 0.
- Backend 2,778 passed / 501 skipped; frontend first run without NODE_ENV=test failed (React.act production build), corrected `NODE_ENV=test` rerun 2,777/2,777 passed; database package 62 passed / 4 skipped; contract 41 passed.
- Production dependency audit exit 0; full audit exit 1 (13 pre-existing development dependency advisories).
- Isolated PostgreSQL 17.11 applied all 311 immutable migrations; app-role ACL report 247 tables, 11 UPDATE and 7 DELETE permissions, confirming separate P0 least-privilege blocker. No shared DB or WLD mutation. Ephemeral container removed after validation.
- Official Test exact-SHA, live authenticated E2E, independent restore, GitOps release gate remain BLOCKED. No release promotion.

## Finished
- Candidate code ready for Draft/HOLD review; integration into main and deployment not authorized.
