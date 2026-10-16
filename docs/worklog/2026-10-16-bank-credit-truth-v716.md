# v2026.10.16.716 — Bank credit real-evidence correction worklog

**English canonical** | [한국어](2026-10-16-bank-credit-truth-v716.ko.md)

## Start / planning authority
- 2026-10-16 KST. User authorized source implementation and asked CI/PR/Test/Production under mandatory deployment instructions.
- Source initial `origin/main=4eef741522c137915b470ab8b5bb5011bbd7170c`; Production/Test currently v712 application `142e36b5...`. Existing v711 and v713 plans were pending PRs at start and merged into main during work; v710 blog/treasury PRs remain separately owned.
- Read `docs/DOCUMENTATION_POLICY.md`, `PROJECT_PLAN.md`, `INTEGRATED_PLANNING_MASTER.md`, v713 EN/KO remediation plan, bank safety EN/KO spec, `docs/RELEASING.md`, prior v714 release gate. Verified PostgreSQL 17 privilege semantics, OWASP actor access and Stripe API idempotency pattern. Pre-work private task log: `/srv/moneyverse-tasks/bank-credit-truth-v716/WORKLOG.md`.
- Independent branch `fix/bank-credit-real-profile-v2026.10.16.716` owns bank backend and score card only. No overlapping blog/treasury/financial-migration edit.

## Read-only evidence
- Development `information_schema`: active actor facts are supported by `public.users(created_at,status)`, `user_job_progress(user_id,level,is_active)`, `virtual_bank_loans(user_id,overdue_at,status)`, `virtual_bank_loan_repayments(loan_id)`.
- Read-only live development query for deliberately nonexistent UUID returned zero rows without schema error. No real member private data fetched, no DB writes, no financial permissions modified.
- P0 parent hold persists: public DEV tables 237/241 app writable, finance raw balance writes and hardcoded treasury reconciliation; 396 DB tests skipped in isolated default suite, exact-SHA Test authenticated session and backups unverified.

## RED/GREEN, source and evidence
- RED backend 3 cases: `BankRepository.getCreditFacts` missing, score amount parser missing; frontend 2 cases initially failed because placeholder instead showed invented 780/4.5% and claimed authority. Frontend tests required explicit `NODE_ENV=test` in this Debian session.
- GREEN: `backend/src/bank/bank.repository.ts` now read-only actor-scoped facts with parameterized SQL; controller no longer hardcodes user age, job level, repayment or default overdue, and binds real bank standing. `toCreditScoreAssets` uses exact bigint input and clamps only the *score bonus input* at the service's existing 75,000 WLD saturation, not the wallet amount itself. Invalid/unsafe inputs fail closed.
- Frontend `credit-score-card.tsx` now separates actual bank-advertised credit limit from a *game-only learning score*, uses exact amount rendering, and shows an explicit unavailable card rather than fabricated score or interest when API fails.
- Added backend regression 3 tests and frontend regression 2 tests, updated two older score-card tests for truthful fallback.
- Green targeted bank backend 3/3 and frontend 4/4, `pnpm typecheck` exit 0, full `NODE_ENV=test pnpm test` exit 0 (backend 1,215 pass/396 skipped; frontend 1,226 pass; remaining bot/contract and tool checks ran); `pnpm lint` exit 0 with 1,088 preexisting warnings; `pnpm build` exit 0. Raw logs private task folder.
- Mid-work `origin/main` advanced from `4eef7415` to `511f9d87` with unrelated v711/v713 planning PR merges; rebase and rerun requirements apply to exact merged application SHA.

## Release and rollback
- No SQL migration or financial debit/credit code changed. Rollback is source revert of this bank credit read-only feature.
- Actual Production modification is **BLOCKED until** required DB ledger/privilege negatives, real signed-in Test bank journey, Test exact-SHA backend/frontend, backup restore, session preservation and controlled zero-downtime release satisfy `docs/RELEASING.md`.
- A green unit/build/CI or an anonymous 200 response is insufficient. No operation or bank WLD debit/credit was exercised.

## Final closure
- GitHub PR and CI/Test status must be entered after branch push; no claim of deployed/passed if unavailable.
