# Backend B v542 — configured ClamAV fail-closed upload scanning

## Start / scope
- Date: 2026-10-26 KST; baseline main: `1c5b84a1c45baafcca83f375a6f99698121e9bb5`.
- Branch: `auto/hourly-b-clamav-failclosed-v542-20261026-0035`; isolated worktree.
- P1: when ClamAV is explicitly configured, transport errors, timeout or malformed replies currently degrade to built-in signatures, and substring `OK` is accepted before `FOUND`. This can misclassify unsafe uploads. Do not change existing no-ClamAV fallback.
- Overlap: open A/C/QA and B Draft PRs reviewed; no current open PR edits `backend/src/content/antivirus-scanner.service.ts` or `chat-upload.controller.ts`.
- Plan: RED tests for configured daemon failures/malformed response/FOUND precedence; GREEN exact ClamAV reply parsing and explicit unavailable failure; controller maps unavailable to 503 without false malware alerts; regression and repository gates; official Test and Production HOLD until every gate passes.

## Checklist
- [x] Read latest main, AGENTS, README, English/Korean plans, PR/CI and QA context.
- [x] Isolated worktree from origin/main; existing A/C/QA branches protected.
- [x] RED tests and failure evidence: first 4 failing cases, then missing Unix socket failing case.
- [x] Implementation and GREEN evidence: 20/20 focused tests on configured TCP daemon, malformed response, timeout, missing Unix socket, HTTP 503, and default behavior.
- [x] Fresh main sync and local unit/typecheck/lint/build/security evidence recorded; real PostgreSQL/authenticated E2E/exact-SHA Test remain BLOCKED.
- [ ] Draft PR and final release HOLD record.

## Start gates
- miniPC Debian 13.6 active; root 98% (2.1 GiB free), data volume 67% (63 GiB free).
- Last v541 Draft #1342 runtime CI failed. Main is unchanged. No Test or Production mutation authorized.

## Midpoint
- Latest `origin/main` fetched again and English/Korean planning files checked; main unchanged from baseline.
- No database migrations, SQL, WLD, ledger, Test or Production changes.
- API contract: `POST /api/v1/content/chat/upload` returns HTTP 503 when configured ClamAV unavailable (instead of false 400 malware finding). Existing 400 for actual detected threats; success response unchanged.
- Unit tests use isolated loopback TCP daemon and synthetic image bytes; no production file or DB access.
- Existing open PR #1300 changes blog scheduler; #1332 encryption; QA #1317 frontend/security dependencies; no overlap with this scanner/controller change.

## Verification and release gate (2026-10-26 KST)
- Start/mid/final `origin/main`: `1c5b84a1c45baafcca83f375a6f99698121e9bb5`; English/Korean plans re-read from latest main.
- RED evidence: first 4 failures (misleading FOUND/OK, malformed ClamAV response, TCP refused, HTTP 503 mapping), then 1 Unix socket failure.
- GREEN: 20/20 focused tests including live loopback TCP clean/FOUND/malformed, refused port, 2.5-second timeout, explicit Unix socket missing and HTTP 503.
- Backend complete unit suite: 1,322 PASS / 398 SKIPPED; Backend build PASS.
- Full typecheck PASS after fixing two exact-optional TypeScript errors; ESLint PASS (0 errors, 1,128 warnings); API contract 179 endpoints PASS; DB package 15 PASS / 3 SKIPPED; bot 8 PASS.
- Security repository/control-byte scripts PASS.
- Full frontend suite 1,397 PASS / 6 FAIL (SEO 3, mobile login 1, calculator CTA 1, admin M2 1).
- Default Turbopack build FAIL due shared symlinked dependency resolution (`next/package.json`); alternate Webpack build PASS.
- Production dependency audit FAIL (High 2: body-parser, multer); full audit FAIL (Critical 2 / High 10).
- Real PostgreSQL integration, authenticated app-api E2E and official Test exact-SHA: BLOCKED / not executed; no changes to DB, SQL, schema, ledger, financial balances, Test or Production.
- Read-only `/api/version`: Test `6f697e74b7bf0cd1e4521d36534cfd9c140f8010`; Production `6a989b5ac0c6155587d43426d64f6def6b62c917`. Neither is candidate.
- Main merge: NONE. GitOps/Production: HOLD. Cleanup: NONE (no other contributor branches or worktrees touched).
- Internal evidence: `/srv/moneyverse-data/build-workspaces/mv-b-v542-logs/` with named RED/GREEN/test/build/audit/security logs.
