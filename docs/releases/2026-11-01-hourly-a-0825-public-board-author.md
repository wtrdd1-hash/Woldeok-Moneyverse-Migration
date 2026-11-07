# Release — Public Board Author Filter (A, 2026-11-01 08:25 KST)

## Scope and evidence
Member-visible public display-name filter for the latest 50 approved board posts across Nest, PostgreSQL read, Next.js and Android app-api. Combines with title/stock. No private identity search or full-archive search.

- Base `origin/main`: `f13bbce273ffc65e8576170992d82ea00c27a1c9`; code commit: `e335311248261aa7689a415edf10250fde2696f2`; branch `auto/hourly-a-20261101-0825-board-author`; Draft PR #2286.
- Remote branches **58 -> 59**; open PRs **56 -> 57**; no reported conflicting PR at start; 58 non-main remote branches have unmerged commits after push. No branch deletion because unintegrated work must be preserved.
- Changed runtime/tests (9): `backend/src/board/stock-community.controller.ts`, `.service.ts`, `.http.test.ts`, `.service.test.ts`; `frontend/src/app/board/page.tsx`, `board-author-search.ts`, `board-author-search.test.ts`; `frontend/src/app/app-api/v1/[...path]/route.ts`, `board-author-search.test.ts`.
- RED -> GREEN evidence: backend focused **28 PASS**; frontend focused **14 PASS**. Root `pnpm test` **timed out at 180s** during frontend, after contract/security **41 PASS**, database **62 PASS/4 SKIP**, backend **2963 PASS/517 SKIP**. Independent frontend full run **2915 PASS**, zero failures.
- Typecheck **PASS**; lint **0 errors / 1022 warnings**; backend/frontend build **PASS**; API contract check **PASS**. These gates ran before the final minor UX copy/cache refinement; focused tests reran after refinement. Final SHA CI required.
- Actual dev PostgreSQL 17.11: `SET LOCAL ROLE moneyverse_app`, `READ ONLY`, `ROLLBACK`; function EXECUTE **true**, bounded row count **1**, author positive **1**, negative **0**. No schema, migration, ledger or balance write.
- P0 **FAIL** in dev DB: app role direct `account_balances UPDATE=true`, `user_items DELETE=true` (issue #993); production ACL not established.
- Official exact-SHA Test/auth/user E2E **BLOCKED** (candidate not deployed); independent restore, production process provenance and GitOps release gate **BLOCKED**. PR #2280 category-filter overlap must be reconciled if it merges.
- Test deploy **none**; Production deploy **none**; rollback **not invoked**; production operations **HOLD**; no deletion or merge.

## Decision
**P1 implemented in Draft; release HOLD.** Do not merge without final exact-SHA CI, real Test/auth E2E, independent restore and P0 least-privilege remediation. English canonical.
