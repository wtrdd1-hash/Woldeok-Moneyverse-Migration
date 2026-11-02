# A 06:25 — Board self-declared position filter — QA (2026-11-03)

**Disposition: IMPLEMENTED IN ISOLATED BRANCH; RELEASE HOLD.** The feature is not on main, Test or Production.

## Scope and source proof
- Web `/board?position=holder|no_position|operator_related|undisclosed` preserves stock and title filters. The four labels are *author self-declarations*, **not proof of holdings**.
- Nest validates exact single query values and returns `appliedPosition` with the bounded 50-row list. PostgreSQL filters `position_disclosure` on `public.member_board_public_list_with_stock(50)` output. No table reads, schema migration, grant, or ledger write added.
- Web and Android App API require an exact applied-filter echo and matching bounded, unique post rows; unverified success becomes unavailable/503. Filtered Android responses enforce no-store/noindex/no-referrer; web search metadata is noindex. No archived-post search.

## Test evidence (local branch, prior to final documentation commit)
- TDD RED: 3 backend and 5 frontend failures before implementation. Targeted GREEN: backend 22/22, frontend 17/17.
- Backend full: 2990 PASS / **2 FAIL** / 518 SKIP; both pre-existing profile HTTP privacy tests return 401 instead of expected 200.
- Frontend full: 2961 PASS on preceding functional revision; final proof helper has targeted 17 PASS, full rerun after final revision required.
- Database package: 72 PASS / 5 SKIP; contract package: 41 PASS.
- Backend/frontend TypeScript checks, targeted ESLint, backend/frontend builds PASS; Next generated 602 pages. Whole-repository lint: 0 errors, 1026 warnings.
- Real PostgreSQL 17.11: read-only `SET LOCAL ROLE moneyverse_app` successfully executed bounded public-list function; 1 recent public row, 0 `holder` rows. No test mutation.
- App API 184-endpoint schema generation completed; generated English/Korean references and contract are included. Contract parity check compares to committed HEAD and must rerun after commit.
- Production dependency audit PASS. Full dependency audit FAIL: 9 findings (1 low, 8 moderate).
- No isolated official Test exact-SHA authenticated E2E or independent backup restore. No evidence of Production parity.

## Existing P0 blockers
- Production `/ko` and `/en`: HTTP 500, existing repair Draft #2552; do not duplicate or bypass its gates.
- Root filesystem 97% used (~3.6 GB available). No destructive cache/worktree cleanup performed.
- QA v1482 DEV DB role review: effective UPDATE on 195 tables, DELETE on 194; Production equivalent not established. Additional migration/search_path concerns remain.
- Main is not integrated with candidate; GitOps release gate and official Test exact-SHA validation are not met.

## Rollback and decision
- No runtime mutation, migrations, feature switch, DB role changes or service restart. Rollback is abandoning/reverting this branch before merge; after merge, revert code only after exact-SHA Test validation. Preserve all unique branches and other agents' changes.
- **RELEASE HOLD** until every required gate passes on the exact integrated SHA. A successful build or CI is insufficient.
