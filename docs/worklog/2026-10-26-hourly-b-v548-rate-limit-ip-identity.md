# Backend B v548 — Canonical rate-limit identity (P1, DRAFT / RELEASE HOLD)

## Before work (2026-10-26 06:3x KST)
- Source main: `1c5b84a1c45baafcca83f375a6f99698121e9bb5` (fresh origin/main).
- Independent branch: `auto/hourly-b-rate-limit-ip-identity-v548-20261026-0635`; worktree: `/srv/moneyverse-data/build-workspaces/mv-b-v548-20261026-0635`.
- Read AGENTS.md, README.md, both living plans, QA security log, open A/C/Gemini/QA PRs, CI, and release policy.
- Priority: requestClientKey accepts equivalent IPv6 and IPv4-mapped IPv6 spellings as distinct tracker keys, allowing budget fragmentation for a single peer. Duplicate CF-Connecting-IP header arrays are silently first-picked rather than rejected.
- Scope: backend security identity normalization and regression tests only; no API/DB schema or finance changes.
- Safety: no shared DB writes, migrations, existing worker branch changes, or production release. Root filesystem 100% (under 1 GiB free); build on data volume only.
- [x] Reproduce with RED tests (4 failed / 24 passed, 2026-10-26 06:36 KST).
- [x] Implement minimal canonical identity normalization and fail-closed ambiguous header handling.
- [x] GREEN focused/backend tests, typecheck, build, lint, API contract and security checks.
- [ ] Full required gates: frontend tests/build, dependency audit, real PostgreSQL and official Test E2E remain BLOCKED.
- [x] Re-fetch main/plans, PR/CI review, final release HOLD and logs.

## In progress
- Mid-work main re-fetch: `1c5b84a1c45baafcca83f375a6f99698121e9bb5`; plan EN blob `51683ec364f9fc1be7bd97e565f48ea2f257ac2a`, KO blob `ba7d055fd2c53e2f04282ac0a9448d0ee8e36254`.
- GREEN: 28/28 focused Vitest; backend 1,317 PASS / 398 SKIPPED; contract build, backend typecheck and backend build PASS.
- RED: four security assertions failed as expected (expanded IPv6, mapped IPv4, trusted-edge canonicalization, ambiguous CF header array).
- Existing 24 tests passed; no source implementation changes at this checkpoint.

## Finished (2026-10-26 06:45 KST) — PARTIAL / BLOCKED
- Code-validated commit: `6d159eef4c22e8a9d0cbf660e199c08590a52c84`; final documentation-only log commit SHA is recorded in PR #1380 and internal end log.
- Draft PR: #1380; main unchanged at `1c5b84a1c45baafcca83f375a6f99698121e9bb5` on mid/final fetch. No merge, branch cleanup, Test deploy or Production deploy.
- Source: `backend/src/security/rate-limit.ts` normalizes valid IPv6 spellings and IPv4-mapped IPv6 to a stable IPv4 key; repeated CF identity headers fall back to the socket. `backend/src/security/rate-limit.test.ts` adds four security regressions. No new endpoint, API payload, DB schema, migration, financial ledger or WLD change. No new dependency.
- RED 4 failed / 24 passed; GREEN 28/28 focused; related rate-limit/throttler/audit tests 39/39 PASS.
- Backend full: 1,317 PASS / 398 SKIPPED; Backend build/typecheck PASS; full workspace typecheck PASS; lint PASS (0 errors, 1,128 existing warnings).
- Database package 15 PASS / 3 SKIPPED; contract 38 PASS; API schema/contract 179 endpoints generated and checked; security policy 6 PASS, dependency floor 6 PASS, E2E certification contract 2 PASS (not real E2E).
- Frontend full 1,397 PASS / 6 FAIL (existing SEO, mobile login, calculator CTA, admin M2 failures). Default Turbopack build FAIL (Next package resolution across symlinked worktree). No claim of successful full build.
- Production dependency audit FAIL (2 High: body-parser, multer); all-dependency audit FAIL (2 Critical, 10 High, 11 Moderate, 3 Low).
- Actual isolated PostgreSQL/app-role security integration: NOT RUN; shared Production/dev DB must not be mutated and root disk at 100% makes Docker scratch creation unsafe. Authenticated app-api/core-user-flow E2E and official Test exact-SHA: BLOCKED. Test public SHA `6f697e74b7bf0cd1e4521d36534cfd9c140f8010`; Production `6a989b5ac0c6155587d43426d64f6def6b62c917`; neither matches candidate.
- GitHub CI #40236626214 and Build Test Candidate #40236606160 were still running for code commit when checked. Later log-only commit requires new exact-SHA checks; no CI PASS claim.
- miniPC Debian 13.6: root `/` 100% (926 MiB available); data volume 74% (50 GiB available). No deletion, cleanup, service restart, or other worker worktree/branch mutation.
- Core A/B/C/Planning/QA automations: 5/5 enabled, read-only verification; settings untouched.
- **Release decision: HOLD.** PR remains Draft. No main merge or Production promotion while required gates fail/are unverified.
