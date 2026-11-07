# A 17:25 Public Board Image-only Filter — QA (2026-11-01)

**Feature code:** `f0f481044b3b92a388b0b2a686d7d674d7823e13` (includes SSR regression). **Base main:** `1e389dc1a6b253f7dbff7cc6765fbe4a17bcb9e0`.

## Scope and proof
- GET `/api/v1/board/public/stock-posts?withImage=1` filters *after* `member_board_public_list_with_stock(50)` by `image_storage_key IS NOT NULL`; optional stock/title filters remain. The `moneyverse_app` role receives no new grants. No schema migration or WLD mutation.
- Browser `/board?withImage=1` has a labelled GET checkbox, bounded-50 explanation, empty/error state and noindex metadata. Android `/app-api/v1/board/public/stock-posts?withImage=1` rejects duplicate/malformed parameters and unverified success payloads, with no-store/noindex.
- TDD RED→GREEN: Backend 3 expected RED then 23 PASS; browser expected RED then 17 PASS; Android 11 expected RED then 12 PASS; SSR 2 PASS. Evidence logs in task `evidence/` on miniPC.

## Gate evidence
- Typecheck PASS; API contract 184 endpoints PASS; Backend build PASS; Frontend build PASS; lint 0 errors / 1022 warnings.
- Backend full: **2969 PASS / 2 FAIL / 518 SKIP**. Both profile owner HTTP tests returned 401 instead of expected 200; same 2 failures reproduced on unmodified main. Repair Draft #2265 owns that scope; no duplicate patch.
- Frontend full final run after SSR tests: **2924 PASS** (558 files). Database unit: **62 PASS / 4 SKIP**. Security script: **11 PASS**. Production dependency audit: no known vulnerabilities. Final SHA CI pending; full Frontend rerun complete.
- Real DEV PostgreSQL 17.11: `BEGIN READ ONLY`, `SET LOCAL ROLE moneyverse_app`, public function EXECUTE=true; latest 50 returned 1 public post with image; prepared SQL filter TRUE and FALSE returned 1 each; ROLLBACK. No real non-image positive sample; covered by unit/contract tests.
- DEV P0 ACL regression: `account_balances UPDATE=true`, `user_items DELETE=true`, `users SELECT=true` for `moneyverse_app`. This does not prove Production grants.

## Integration and release blockers
- Other open Draft board PRs #2280, #2286, #2304 and #2337 touch the same files; preserve and reconcile before merge. GitHub start: 105 open PRs, 22 conflicts; 114 non-main branches, 107 with unique commits, 7 ancestors. No branch deletion.
- Official Test Backend+Frontend `bc8cd8a6c654af0336f550643f23049a58ee1d16`, not candidate. Production Backend `353c6d5d6ddbc14b1067e84f9c4a127bab1c3834`; Frontend exposes non-SHA `1793450413898`. Exact-SHA Test authenticated E2E, independent restore, least privilege and GitOps release gate not satisfied.
- **HOLD**: no merge, Test or Production deployment, DB writes, service restarts, or rollback. Missing PASS evidence must not be inferred.

## End-of-task audit
- Draft PR #2350 with `hold` label. Final inventory: 106 open PRs (22 conflicting), 115 non-main remote branches (108 with unique commits, 7 main ancestors, 0 duplicate tips). No deletion; 4 overlapping board Draft PRs preserved.
- Test/Production deployment, service restarts, operational DB writes and rollback: **0**. No exact-SHA Test PASS evidence; no merge.
