# 2026-10-29 — Development A: verified notification search (DRAFT / RELEASE HOLD)

## Before work — 22:22 KST
- Source main: `0a4327f73e0d2d4dc5deb614a1bb9b8cb04ee6d2`; isolated branch `auto/hourly-a-notification-keyword-20261029-2225`.
- Debian 13.6 miniPC, service status active, DEV PostgreSQL connected. Existing main checkout has unrelated uncommitted edits; it is untouched.
- Read AGENTS.md, README.md, bilingual PROJECT_PLAN and integrated master, current QA/CI, 5 open PRs, 9 remote branches. Preserve all other workers' refs and changes.
- Selected P1: member-only historical notification search with strict validation, owner/session binding, signed keyset pagination, read-only database query, Next BFF, Android contract, accessible member UI. No ledger or notification mutation.
- Dependencies: schema lineage for `in_app_notifications` is not proven, official Test exact-SHA E2E and finance/backup release gates are blocked. Never claim a release without all gates.

## Plan
1. Add failing backend/frontend validation and cursor tests (RED).
2. Implement safe backend search + BFF + member search UI, using existing schema without changing applied migrations or granting table permissions (GREEN).
3. Verify PostgreSQL owner/date/index behavior with isolated synthetic fixture and fail closed on missing schema/index.
4. Run required gates, capture actual failures, refresh main and PR inventory, publish Draft PR, preserve unmerged work.

## In progress
- Baseline source and QA examined. Work remains isolated.

## Finished
- Pending exact-SHA verification and release decision.

## In progress — 22:29 KST
- RED tests initially failed because the search modules/routes did not exist; implemented backend DTO, owner/session HMAC cursor, read-only indexed PostgreSQL query with 2s statement timeout, Next CSRF BFF, gated responsive member UI and Android app-api no-store/noindex response.
- Feature is OFF unless `NOTIFICATION_SEARCH_ENABLED=true` is set on both Backend and Frontend. No migrations were written: current `in_app_notifications` DDL lineage is unproven; existing owner/date index was read directly from DEV metadata. No table privilege changes.
- Backend focused 4 PASS; Frontend focused BFF/parser 5 PASS; existing `app-gateway.test.ts` help-related assertion fails independently. Initial Typecheck failed on a nullable request header; corrected and Frontend typecheck PASS. Full gates and isolated real PostgreSQL still pending.
- Mid-run origin/main refreshed. Do not merge or promote without exact-SHA full gates and official Test.

## In progress — 22:32 KST
- Rebased on updated main `3a34fe1705875c8999e9ad5761145113e229e44d` without conflict. Other developers' worktrees and uncommitted main changes remain untouched.
- Isolated PostgreSQL 17.11 (network disabled, disposable tmpfs) loaded 10,001 synthetic notifications (9,001 owner / 1,000 other owner); Korean literal search, owner scope, 2-second read-only transaction, B-tree index plan passed; 0.471ms measured execution on synthetic dataset. Container removed. This is **not** official Test E2E or schema-migration parity.
- `pnpm typecheck` PASS; Backend search tests 4 PASS; Frontend search/BFF tests 5 PASS. Existing unrelated app-gateway help-path test still fails.
- Mobile API contract manually added as a new documented endpoint and generated EN/KO schema references. Existing generated `affinity` response type drift is present and is recorded, not silently ignored.
- The search relies on the existing observed `in_app_notifications` owner/date index and existing app-role SELECT; no new SQL migration or grant due unverified table-creation lineage. The full planned SECURITY DEFINER and distributed rate-budget controls are not certified. Feature remains OFF by default; release HOLD.

## In progress — 22:41 KST
- Generated Android contract `pnpm api:contract:check` PASS (182 endpoints); full Typecheck PASS; changed-file ESLint PASS; Database 56 PASS/4 SKIP; Bot 11 PASS after isolated npm install; pnpm production audit and bot audit 0 known vulnerabilities.
- Backend full: 2,354 PASS / 240 FAIL / 493 SKIP, mostly pre-existing monetary HTTP boundary failures; Frontend full timed out after 110s with unrelated finance failures observed. Full ESLint FAIL (3 existing `stale-tab-notice.tsx` no-empty errors; QA #1894). Backend build PASS; Frontend production build PASS on retry after initial 45s timeout.
- Exact candidate CI for SHA `d7d74b0410ce689b5b4ba9e860f43618dd5070eb` FAILED at the same three lint errors; candidate image build SKIPPED. No production action.
- Test and Production `/api/version` both HTTP 200, `c2129625aa6629c616fb31ce790950618b8d92b2`, not candidate. Official authenticated Test E2E and independent restore remain BLOCKED.
- Mid-run audit: 13 remote branches, 8 open PRs, 4 ancestor-only branches (including main excluded), remaining unmerged unique commits preserved. No branch/PR deletions.

## Finished — 22:44 KST (candidate / NOT RELEASED)
- Code candidate `f08f08e554df67eda44f05b25efe0419d7af68a3` rebased on main `54b182d2214a15974350701174175f589789613b`; exact candidate API contract, workspace Typecheck, changed-file ESLint, backend build, frontend Next production build and focused tests PASS. Android contract 182 endpoints, Backend focused 7 PASS, Frontend focused 8 PASS, Database 56 PASS/4 SKIP, Bot 11 PASS, production and bot audits 0 known vulnerabilities. Isolated PostgreSQL 17.11 10,001 synthetic rows owner/index/keyword query PASS; not official Test.
- Full repository lint FAIL (3 unrelated stale-tab no-empty errors), Backend full 2,354 PASS / 240 FAIL / 493 SKIP (monetary HTTP and other pre-existing failures), Frontend full timeout after 110s with unrelated finance failures. GitHub exact code candidate runtime checks FAILED at lint; candidate image build SKIPPED. Never substitute focused PASS for full release certification.
- Source files changed: backend notification DTO/controller/service/cursor and tests; Next notification search BFF and member UI/parser/tests; Android gateway cache/privacy and machine-generated EN/KO contract/spec; this worklog. No applied migration, finance/ledger, privilege, production database or existing notification mutation changed.
- Branch inventory start 9 total / 5 open PRs; latest mid-run 13 total / 8 open PRs. 0 branches deleted, 0 PRs closed, 0 main merges; every unmerged unique commit preserved, ancestor-only refs retained due historic mass-deletion incident #1663. Other developers' main checkout and QA/finance branches were untouched.
- Test and Production version read-only HTTP 200: `c2129625aa6629c616fb31ce790950618b8d92b2` (not candidate). No Test/Production rollout, database migration, backup restore, finance transaction or rollback. Feature default OFF; safe fallback is the unchanged existing inbox. No user-visible release.
- P0/P1 release HOLD: full F675-174 SECURITY DEFINER/DDL lineage, shared rate limiting, 100/100/50/30 adversarial acceptance, exact-SHA official Test auth/E2E, financial provenance (18,000 WLD/552 Treasury links), five historical migration checksum mismatches and independent restore are not certified. PR #1904 remains DRAFT. Docs-only is not counted as success; this is an unmerged, disabled P1 code candidate.
