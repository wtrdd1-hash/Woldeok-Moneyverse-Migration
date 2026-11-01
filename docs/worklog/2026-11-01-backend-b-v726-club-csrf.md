# Backend B v726 — Club and warfare CSRF boundary

## Before work
- [x] Read AGENTS.md, README.md, English/Korean living plans, QA and open PRs.
- [x] Start from main `1e389dc1a6b253f7dbff7cc6765fbe4a17bcb9e0` in isolated branch `auto/hourly-b-v726-club-csrf-20261101-1735`.
- [x] Select unique P1 security gap: ClubController and WarfareController omitted CsrfGuard on state-changing HTTP methods.
- [x] Preserve SessionGuard → AuthenticatedGuard → ConsentGuard order; use the existing session-bound CsrfGuard. No DB or ledger change.

## In progress — RED/GREEN
- [x] New Nest HTTP test (real CsrfGuard + fake SessionRepository) reproduces missing/forged token bypass. Initial RED run: 11 failures; later corrected PATCH/PUT expected 200 (not 201).
- [x] Add CsrfGuard after ConsentGuard to both controllers. Read-only GET/HEAD remains safe. Keep club/warfare WLD settlement 503 holds.
- [x] Update three existing Nest test fixtures to override CsrfGuard only for tests of unrelated paging and finance 503 behavior.
- [x] New HTTP tests 12/12 PASS; club-focused HTTP regression 24/24 PASS.
- [x] Browser frontend club mutations omit x-csrf-token; coordinated separate A/C handoff #2352. Do not merge backend-only changes that break these user flows.

## Verification and blockers
- [x] Backend TypeScript, Backend build, whole-workspace lint (0 errors, 1,022 pre-existing warnings) and whole-workspace typecheck PASS.
- [x] Isolated PostgreSQL 17.11: all 316 immutable migrations applied, app-role direct balance UPDATE and ledger DELETE denied. Session repository DB tests 17/17 PASS; club fixture-specific DB tests 6 SKIP (fixed external synthetic fixture ports not available).
- [x] Database package 62 PASS / 4 SKIP; Contract 41 PASS; mobile API contract 184 endpoints matched.
- [x] Security/backup/release unit checks 20 PASS; production dependency audit no known vulnerabilities.
- [ ] Backend full test timed out after 155 seconds; no complete PASS claim.
- [ ] Frontend full test 2,372 PASS / 497 FAIL (existing React act and related failures); no complete PASS claim.
- [ ] Frontend production build compiled successfully but timed out during TypeScript after 105 seconds; no complete PASS claim.
- [ ] Full dependency audit reports 9 low/moderate advisories.
- [ ] Official isolated Test exact-SHA, real authenticated club user-flow E2E, independent restore, GitOps release gate, and full remote CI not certified.

## Finished — RELEASE HOLD
- Candidate remains Draft/HOLD until frontend CSRF integration, all full gates and exact-SHA Test pass.
- No main merge, shared DB write, Test deployment, Production promotion, or branch cleanup.
- Final SHA and CI status are recorded in the PR and local logs.
