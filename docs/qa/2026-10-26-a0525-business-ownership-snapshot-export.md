# QA — A0525 Private Current Virtual Business Holdings CSV — 2026-10-26

**Decision: PARTIAL / BLOCKED. Production RELEASE HOLD.** English source of truth.

## Scope and implementation
- Base main: `1c5b84a1c45baafcca83f375a6f99698121e9bb5`; branch: `auto/hourly-a-business-ownership-export-20261026-0525` (final SHA in PR).
- Authenticated/consented member exports **current** owned virtual businesses, up to 100, as CSV from `/businesses`. This is a snapshot, NOT a purchase, settlement, ledger or audit receipt; no historic completeness claim.
- Backend `GET /api/v1/businesses/ownerships/export-data` uses server-derived session actor, existing `business_my_ownerships_v2($1)` SECURITY DEFINER owner read and 100-row fail-closed limit; no direct table DML or new migration. `last_settlement_date::text` keeps date canonical.
- Frontend `/businesses/ownerships.csv` requires verified viewer, revalidates every row, prevents CSV formula/control/bidi injection, preserves exact integer strings, private/no-store/noindex/nosniff and 503 on uncertain data. Member page metadata noindex, keyboard-operable link. Android `/app-api/v1/businesses/ownerships/export-data` preserves cookie, denies upstream 401, forces private/no-store/noindex. Mobile API contract: 180 endpoints.

## Verification (candidate local, not authorized release)
- RED: missing CSV module/route; backend initially blocked by unbuilt contract. GREEN: backend focus 5 PASS, frontend CSV/route/gateway 18 PASS, private SEO 1 PASS.
- Backend suite 1,318 PASS / 398 SKIPPED; frontend suite 1,406 PASS / **6 FAIL** (SEO/i18n 3, login accessibility 1, calculator registration 1, admin M2 telemetry 1); database package 15 PASS / 3 SKIPPED; contract 38 PASS.
- Typecheck PASS; backend/frontend builds PASS; lint PASS 0 errors / 1,128 warnings; changed-file lint PASS.
- `pnpm audit --prod` FAIL 2 High; full `pnpm audit` FAIL 2 Critical/10 High/11 Moderate/3 Low; bot `npm audit` FAIL 1 Critical/5 High.
- `pnpm test` initially failed because generated Android contract differed from pre-commit HEAD; rerun at final SHA after committing artifacts.
- Isolated PostgreSQL 17.11 `moneyverse-test-db`/`wdmv_v761_test_acl`: 281 migrations; rollback-only fixture with session-local trigger bypass for synthetic ownership, `moneyverse_app` read 1 owner holding and 0 other-user holdings; EXECUTE true, direct ownership SELECT false, ledger INSERT false. `ROLLBACK` verified 0 remaining holdings. No 5433/live DB writes.

## Release gates and rollback
- Official public Test `/api/version` still `6f697e74b7bf0cd1e4521d36534cfd9c140f8010`, not candidate. Authenticated official Test exact-head E2E (web + Android + finance) **BLOCKED**; candidate CI/runtime gate not green. Production previously observed `6a989b5ac0c6155587d43426d64f6def6b62c917`, not touched. GitOps approval and smoke/login/version/DB promotion **NOT RUN**.
- Root disk 99% (1.2 GiB free), data mount 71%; avoid destructive cleanup.
- Rollback: read-only feature; do not deploy/merge until gates PASS. If eventually released, revert route/link/backend export in reviewed commit, preserve immutable migrations and ledger. No DB rollback needed.
- Branch safety: 224 remote branches / 220 open PRs at start; conflicts #1107/#1110/#1143 preserved; no branch deletion or other worker branch edits. Exact ending counts and CI results in PR evidence.

## Integration-precheck and branch audit (05:39 KST)
- Code+contract+QA commit: `62b1d37e7d2a1e9e560b8ecb49d968c41ac92931`; Draft PR #1373, mergeable but **not approved**. CI #40231742835 and Test Candidate #40231738281 initially IN_PROGRESS; not PASS.
- Final observed remote branch count 226 (start 224); open PR 221 (start 220); other worker concurrently added branch(es). 225 non-main branch tips; 0 duplicate final SHA across remote heads. Three known conflicting PRs #1107/#1110/#1143 remain. All branches retained because unintegrated uniqueness was not disproven. Deletions: 0.
- Changed tracked files: 19 (backend controller/repository/test, frontend BFF/CSV/SEO/gateway/test, 3 Android contract artifacts, plan/QA/worklog/release EN+KO). No applied migration or schema changes.
- Final post-documentation SHA and CI conclusions will be attached to PR #1373 without rewriting committed QA history.
