# Backend B v534 — Blog scheduler credential and response integrity

## Before work (2026-10-25 16:34 KST)
- Main baseline: `1c5b84a1c45baafcca83f375a6f99698121e9bb5`.
- Independent branch: `auto/hourly-b-blog-scheduler-credential-v534-20261025-1635`.
- Debian 13.6 miniPC healthy; root 94% used, data 57% used. No live DB writes.
- Read AGENTS, README, English/Korean project plans, open PRs, latest planning/QA issues and CI. Avoid open Discord broadcast PR #1285 and SWF/enterprise overlaps.
- Selected P1: scheduler blog publication sends a hardcoded default internal credential and trusts unverified response fields. Fail closed without a configured secret, validate origin, and never report remote JSON as authoritative status.
- Scope: scheduler HTTP handler and isolated regression tests only. No migration, ledger, auth session or production config change.

## In progress
- [ ] Add failing regression tests for absent/weak credential, target URL, and response truth.
- [ ] Implement minimal safe scheduler handler.
- [ ] Re-run targeted and mandatory verification; refresh main/plans.

## Finished
- Pending.

### Implementation checkpoint (16:43 KST)
- RED: backend import missing and frontend accepted a short configured scheduler key (201 instead of 403); follow-up whitespace credential regression RED in backend.
- GREEN: extracted `publishScheduledBlog` with explicit >=32-byte non-whitespace credential, denial of known published defaults, no fallback from weak primary key, safe HTTPS/loopback origin, manual redirects, 10-second timeout, 201+JSON success confirmation, and redacted transport failure.
- Frontend POST scheduler credential now enforces matching strength and timing-safe comparison; admin session path remains unchanged. No API route added.
- Files: `backend/src/scheduler/blog-publisher.ts` and `.test.ts`; `backend/src/scheduler/scheduler.module.ts`; `frontend/src/app/api/blog/generate/route.ts` and `.test.ts`.
- Backend focused 16/16 PASS, frontend focused 5/5 PASS. Backend full 1323 PASS / 398 SKIP; frontend full 1398 PASS / 6 FAIL (unrelated locale, SEO, login touch target, M2 telemetry); DB 15 PASS / 3 SKIP; contract 38 PASS.
- Backend and frontend typechecks PASS; backend build PASS; default Turbopack frontend build PASS; full lint PASS with 0 errors / 1127 existing warnings.
- Production dependency audit FAIL (2 High: body-parser and multer). No dependency changes to avoid overlapping open security work.
- Real PostgreSQL integration and authenticated official Test exact-SHA NOT RUN; no live DB writes. No new SQL, migrations, or ledger mutations.
- Midpoint origin/main refreshed unchanged at `1c5b84a1c45baafcca83f375a6f99698121e9bb5`; English and Korean plans refreshed. Existing open PR #1294 modifies public blog readership, not the private publication scheduler.

## Finished (16:43 KST)
- [x] Failing tests reproduced before implementation; corrected after GREEN.
- [x] Minimal runtime/API security changes with regression coverage.
- [x] Backend unit, DB package, contract, lint, typecheck, and build executed.
- [x] Default frontend build executed; full frontend test failures and audit vulnerabilities recorded as BLOCKED.
- [ ] Required full security, isolated PostgreSQL/authenticated E2E, official Test exact-SHA and GitOps release gates: BLOCKED.
- Draft PR only; no merge, Production, Test promotion, cleanup, or modification of other branches/worktrees.
- Environment contract: configure matching strong `INTERNAL_API_SECRET` (preferred) or `CRON_SECRET` (fallback only when primary absent) on scheduler and frontend. If missing or weak, scheduled publication skips; administrator session publishing remains available. Do not log secret values.
- Exact candidate SHA and CI outcomes will be recorded in PR/checkpoint after push.
