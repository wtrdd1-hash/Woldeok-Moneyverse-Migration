# Backend B v736 — Banking Android App API Private Edge (Draft / Release HOLD)

**Date:** 2026-11-02 KST. **Base main:** `510dbe6bf4d5c2a8089fc06b480776053da7a2e3`. **Branch:** `auto/hourly-b-v736-banking-app-api-private-edge-20261102-0035`.

## Selection and duplicate protection

Initial research reproduced Backend bank/pocket private-header omissions, but the final complete open-PR audit identified the exact same Backend fix already owned by **Draft PR #2273 (B v709)**. All duplicate Backend code and tests were removed from this branch **before commit**; PR #2273 remains untouched. This PR changes only the distinct Android App API banking edge policy and its regression tests. Other A/C/QA and Gemini worktrees are untouched.

## P1 finding and actual code

The Android App API already forced `Cache-Control: private, no-store` on `/bank` and `/banking` responses, but did not force `X-Robots-Tag: noindex` or `Referrer-Policy: no-referrer` on those routes. A stale upstream could supply indexable/unsafe headers on successful owner banking data, auth 401, CSRF 403 and HEAD. This is a conditional privacy hazard, not evidence of actual user data leakage.

The Next App API handler now forces noindex and no-referrer for both bank route families in addition to existing private no-store, independent of upstream policy. No API body/status contract, auth, CSRF, Backend, database, migration, ledger or WLD balance changes.

## RED → GREEN

- New Android App API HTTP regression: **3 FAIL** before change, **3 PASS** after change. Neighboring support/collection regressions also PASS (7 total).
- Initial independent Backend research: 6 RED / 1 PASS then 7 GREEN, **not retained in this PR** after identifying prior #2273. Do not attribute those Backend fixes to v736.
- Final unmodified Backend full suite **2,978 PASS / 2 FAIL / 518 SKIP** (profile HTTP fixture internal token issue tracked in #2265). Temporary exploratory Backend tests were removed before this final run.
- Frontend full **2,925 PASS**, full lint 0 errors/1,027 warnings, typecheck PASS, full build PASS, contract 41 PASS, database 62 PASS / 5 SKIP.
- Real isolated PostgreSQL 17.11: 322/322 canonical migrations (002–323), 18 banking integration PASS; app balance UPDATE=false and ledger DELETE=false. Isolated container removed. No shared DB changes.
- Broad security/QA policy **FAIL** on existing obsolete warfare text assertion (issue #2391, Draft #2394/#2398). Full dependency audit: 9 low/moderate findings; production audit 0 known vulnerabilities.

## Release decision

**Draft/HOLD**: Existing Backend test failures, broad policy regression, Test exact-SHA/E2E and GitOps gates remain unresolved. No merge, Test/Production deployment, shared DB mutation or branch cleanup. Final commit SHA, CI and exact-SHA evidence recorded in task logs and PR.
