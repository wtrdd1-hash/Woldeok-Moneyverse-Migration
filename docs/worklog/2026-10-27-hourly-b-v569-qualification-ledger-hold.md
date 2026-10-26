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
- [ ] Verify final SHA tests, build, lint/typecheck, security, PostgreSQL where feasible
- [ ] Re-fetch main/plans and record release HOLD, push Draft PR

## RED checkpoint — 2026-10-27 02:35 KST
- Added `backend/src/work/work-qualification-ledger-hold.test.ts` (four tests).
- Executed `pnpm --filter @moneyverse/backend exec vitest run src/work/work-qualification-ledger-hold.test.ts` on main-derived branch: **3 FAILED / 1 PASSED**, as expected. Controller still invokes repository, null repository emits a generic 503 without ledger code, repository attempts feature SQL. Evidence: internal `v569-logs/red-test.log`.

## GREEN checkpoint — 2026-10-27 02:36 KST
- Added shared `refuseUnjournaledQualification` 503 with `WORK_QUALIFICATION_LEDGER_UNAVAILABLE`.
- Controller refuses certification before repository access, while keeping session/auth/consent/CSRF guards. Repository refuses direct calls before feature lookup or SQL. GET qualification catalogue and other work routes remain unchanged.
- `pnpm --filter @moneyverse/backend exec vitest run src/work/work-qualification-ledger-hold.test.ts`: **4/4 PASS**. Evidence: internal `v569-logs/green-test.log`.
- This is **NOT** a DB boundary fix: app role still has EXECUTE on the applied function. Existing credentials or direct DB callers can bypass API/repository containment; a forward-only migration and exact-SHA rollout remain required.
