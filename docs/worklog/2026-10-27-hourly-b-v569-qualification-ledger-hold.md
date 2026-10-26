# Backend B v569 — P0 qualification fee ledger containment (DRAFT / RELEASE HOLD)

## Start — 2026-10-27 02:35 KST
- Canonical `origin/main`: `0fe614b2ca1a7bc0df540514e54db78130479e2a`.
- Branch: `auto/hourly-b-qualification-ledger-hold-v569-20261027-0235`, independent worktree.
- Source issue: #1477, direct `account_balances` updates inside applied `job_certify_qualification`, without authoritative balanced postings. The app role retains EXECUTE; read-only QA evidence only, no historical loss established.
- Read AGENTS.md, README, English canonical and Korean auxiliary plans, QA issue, open PRs (A #1418/#1464, C #1474/#1470, B #1471/#1473 and planning #1476), CI. No overlapping qualification PR found.
- **Design (bounded containment):** reject certification at HTTP entry point with stable 503 code; reject direct `WorkRepository.certifyQualification` before any SQL, even when the feature switch is enabled. Keep GET qualifications and all other work routes unchanged. Do not modify applied migration 234, app grants, balances, or live DB. This is a containment candidate only, not ledger settlement or DB EXECUTE revocation.
- **Tests:** red/green controller and repository tests; work E2E guard contract; typecheck, lint, build, unit/integration, CI and isolated PostgreSQL as available. All release gates must pass before merge.

## Checklist
- [x] Verify miniPC and latest main; read instructions, plans, QA/PR/CI
- [x] Create independent worktree and write initial log
- [x] RED: reproduce unsafe controller/repository certification invocation
- [x] GREEN: fail closed with stable API code, preserve read paths
- [x] Verify candidate tests, build (required FAIL), lint/typecheck, security (full FAIL), isolated PostgreSQL (containment PASS)
- [x] Re-fetch main/plans and record release HOLD; push Draft PR pending

## RED checkpoint — 2026-10-27 02:35 KST
- Added `backend/src/work/work-qualification-ledger-hold.test.ts` (four tests).
- Executed `pnpm --filter @moneyverse/backend exec vitest run src/work/work-qualification-ledger-hold.test.ts` on main-derived branch: **3 FAILED / 1 PASSED**, as expected. Controller still invokes repository, null repository emits a generic 503 without ledger code, repository attempts feature SQL. Evidence: internal `v569-logs/red-test.log`.

## GREEN checkpoint — 2026-10-27 02:36 KST
- Added shared `refuseUnjournaledQualification` 503 with `WORK_QUALIFICATION_LEDGER_UNAVAILABLE`.
- Controller refuses certification before repository access, while keeping session/auth/consent/CSRF guards. Repository refuses direct calls before feature lookup or SQL. GET qualification catalogue and other work routes remain unchanged.
- `pnpm --filter @moneyverse/backend exec vitest run src/work/work-qualification-ledger-hold.test.ts`: **4/4 PASS**. Evidence: internal `v569-logs/green-test.log`.
- This is **NOT** a DB boundary fix: app role still has EXECUTE on the applied function. Existing credentials or direct DB callers can bypass API/repository containment; a forward-only migration and exact-SHA rollout remain required.

## Verification checkpoint — 2026-10-27 02:46 KST
- Code SHA before this documentation checkpoint: `aa8a996d0e1e0651aa51256ef8fcc94dfb36852c`.
- RED 3 failing / 1 passing; GREEN 4/4 passing. Work route + hold tests 31/31 PASS. Class guard order unchanged.
- `pnpm typecheck` PASS. `pnpm test` PASS: contract 38, database package 15 PASS / 3 SKIPPED, backend 1,330 PASS / 398 SKIPPED, frontend 1,423 PASS. These are local/mock tests; skipped DB tests are NOT passes.
- `pnpm lint`: exit 0, 0 errors, 1,131 warnings. `pnpm audit --prod --audit-level high`: PASS, 0 vulnerabilities.
- `pnpm audit --audit-level high`: **FAIL** (2 critical / 8 high / 11 moderate / 3 low). Bot audit: **FAIL** (1 critical / 5 high). `pnpm bot:test` 8/8 PASS after using existing previous B worktree's read-only bot dependency tree; initial run was missing local `youtube-dl-exec`.
- **Required default `pnpm build`: FAIL** on this worktree, repeated three times: Next 16.4.2 Turbopack `next/font/google` 496 module resolution errors (`@vercel/turbopack-next/internal/font/google/font`, `next/font/google queries have exactly one entry`). Backend/contract builds pass. Diagnostic `next build --webpack` PASS, **does not substitute for required default build**. No product source altered to work around this.
- Isolated PostgreSQL 17.11: PASS for **containment only**. Ephemeral loopback-only container with synthetic unsafe function granted to a synthetic app role: repository returns 503 and test counter stays 0. Container removed. This is NOT a full real schema/migration/role or authenticated financial E2E test.
- QA full-route ledger: **BLOCKED**; local script requires separately generated `--inventory` and `--ledger` evidence; no invented result.
- Read-only `/api/version` evidence: Test `6f697e74b7bf0cd1e4521d36534cfd9c140f8010`, Production `6a989b5ac0c6155587d43426d64f6def6b62c917`; neither is this candidate.
- Re-fetched `origin/main` at start/mid/end: `0fe614b2ca1a7bc0df540514e54db78130479e2a` unchanged. Re-read canonical English and auxiliary Korean plans on main; reviewed newer **unmerged** planning v1336 Draft #1476. No competing qualification PR found.
- miniPC root `/` 99% (~1.8 GiB free), data volume 92% (~16 GiB free). No shared worktree cleanup or DB mutation.

## Contract, limitations and release disposition
- Existing `POST /api/v1/work/qualifications/certify` now returns **503** and stable `WORK_QUALIFICATION_LEDGER_UNAVAILABLE` before unsafe SQL; `GET /api/v1/work/qualifications` and other work functions unchanged. No DB migration, WLD change, auth bypass or idempotency receipt claimed.
- **P0 remains open**: migration 234's SECURITY DEFINER function is still executable by the app DB role; callers with direct DB credentials can bypass the API/repository guard. Applied migration 234 checksum drift (#1469) remains unresolved. Full fix needs forward-only ledger-first migration, DB privilege boundary, reconciliation, rollback, exact-SHA Test and approved release.
- Frontend currently maps the 503 to a generic retry message; coordinate with Development C for truthful paused-exam UX and avoid implying the member's WLD balance caused the hold.
- **RELEASE HOLD**: full audit FAIL, required default build FAIL, CI and exact-SHA official Test/auth/DB/E2E not yet PASS, backup/restore and GitOps release gate not verified. No merge, no Test promotion, no Production deployment, no branch cleanup. Other A/C/Gemini/QA workspaces and automations untouched.
