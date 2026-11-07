# Backend B v751 — Quant POST session-bound CSRF guard (DRAFT / RELEASE HOLD)

Date: 2026-11-02 KST. Canonical origin/main at start/mid/final: `a8541927c3a351d980454c66e95a3356c47e0722`. English `docs/planning/PROJECT_PLAN.md` remains canonical; Korean `.ko.md` reviewed for parity. QA v1461 FAILED/P0; no duplicate open Quant CSRF PR; A board, C stock-alert and B derivatives/bond PRs left untouched.

## Verified defect and bounded correction

Three member-only Quant POST endpoints (`/quant/strategies`, `/quant/backtest`, `/quant/strategies/:id/toggle`) used session/authentication/consent but omitted `CsrfGuard`. HTTP tests demonstrated missing CSRF returned the existing HTTP 503 evidence hold, not a CSRF-specific HTTP 403. This is a missing request-boundary guard; it is **not** evidence of financial execution or member losses. Existing Quant routes fail closed with 503 and frontend Quant Studio runs explicitly local example simulation, without an active Backend POST flow.

Apply `@UseGuards(CsrfGuard)` to the three POST methods, keeping class-level `SessionGuard`, `AuthenticatedGuard`, `ConsentGuard`. Require a session-bound `x-csrf-token` for POST, not GET. No new backend financial execution, no data model, migration, ledger, WLD balance or public contract response changes. Error contract: missing/invalid CSRF -> 403; unauthenticated -> 401; expired consent -> 428; valid CSRF -> existing 503 (unverified source); GET remains existing 503 without CSRF. Future frontend POST activation must use authenticated same-origin server action and the current session token; no unsupported backend-only success claim.

## RED → GREEN and candidate verification

- RED: `quant-write-csrf.http.test.ts` 6 FAIL / 5 PASS; missing CSRF returned 503, and valid requests never invoked `verifyCsrf`.
- GREEN: Quant focused suite 18/18 PASS, including 11 new real Nest HTTP CSRF cases, 3 existing HTTP truth cases and 4 controller truth cases.
- Full workspace Lint: PASS (0 errors, 1,027 pre-existing warnings); Typecheck PASS; Backend Build PASS; Frontend Build PASS (602 static pages).
- Backend full suite: 2,989 PASS / 2 FAIL / 518 SKIP; pre-existing profile private HTTP cases expect 200 but receive 401. Release BLOCKED.
- Frontend full suite: 2,922 PASS with `NODE_ENV=test` and `--maxWorkers=4`. Initial default run timed out; separate `pnpm exec vitest` without `NODE_ENV=test` produced unrelated fixture failures, corrected by the repository-required environment.
- Contract 41 PASS; Database 62 PASS / 5 SKIP; Quant frontend truth 2 PASS; security-focused 19 PASS.
- Isolated disposable PostgreSQL 17.11: 322/322 migrations applied, 42/42 actual DB tests PASS, funded Treasury–NPS double-entry/replay/rollback fixture PASS; `moneyverse_app` account balance UPDATE and ledger posting DELETE denied. Test container removed; shared DB untouched.
- Production dependency audit 0 findings; full audit 9 findings (8 moderate, 1 low). Release BLOCKED.
- Official Test and Production `/api/version` both advertise `510dbe6bf4d5c2a8089fc06b480776053da7a2e3`, not this candidate or main. Official exact-SHA Test, authenticated E2E, independent off-host restore and GitOps release gates NOT PASS / BLOCKED.

## Release and ownership

Independent B v751 branch and Draft/HOLD PR only. No main merge, no Test deployment, no Production promotion, no financial write. Other A/C/Gemini/QA worktrees and scheduled tasks preserved. Source-of-truth plan and origin/main checked again before PR creation; no changes to migration numbers or applied files. No branch cleanup except the isolated PostgreSQL container. Backend HTTP guard correction is implemented but **release is not approved**.

Internal logs: `/srv/moneyverse-data/tasks/mv-b-v751-quant-write-csrf-20261102-1135/logs/`.
