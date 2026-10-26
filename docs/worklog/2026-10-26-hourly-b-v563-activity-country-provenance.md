# B v563 — request activity country provenance (DRAFT / HOLD)

## Before work — 2026-10-26 21:01 KST

- Debian 13.6 miniPC connected using required status, command and file-read MCP actions (file-read returned no body; inspected AGENTS.md via server command).
- Starting `origin/main`: `0fe614b2ca1a7bc0df540514e54db78130479e2a`.
- Read `AGENTS.md`, `README.md`, `docs/planning/PROJECT_PLAN.md`, `.ko.md`, open PRs and CI; main includes prior B v561; B v562 PR #1453 and C v1073 PR #1454 touch other files.
- Created independent branch `auto/hourly-b-activity-country-trust-v563-20261026-2100` and worktree on data volume.
- P1 defect: untrusted request headers can forge country in Backend request-activity audit records. This is metadata spoofing, **not evidence of an actual attack**.
- Root disk at 99% (1.5 GiB available at start), P0 issue #1170; preserved all other worktrees and service state.

## In progress

- RED: 2 new tests failed on original middleware (`CF-IPCountry` accepted without trusted proxy; `X-Vercel-IP-Country` accepted despite Cloudflare-only trust). A third malformed-country case already passed.
- GREEN: 5/5 middleware tests pass after applying the existing proxy trust switch and removing untrusted fallback.
- Backend full test: 1,329 passed, 398 skipped (DB-backed tests not run against live/shared DB).
- Workspace lint: 0 errors, 1,131 existing warnings; root typecheck passed.
- Workspace test: frontend 1,423 passed; backend and other workspace results captured in run log.
- No API route/DTO, SQL migration, authorization or financial ledger changes.

## Finished / gate state

- Changes: `backend/src/activity/request-activity.middleware.ts`, associated test, this plan and worklog.
- DB contract: unchanged; audit `country` is now `null` when edge provenance cannot be trusted.
- Local security regression PASS; full CI and official Test exact-SHA, authenticated E2E, real PostgreSQL ACL/integration and GitOps release gates must be independently verified.
- Merge: NONE. Test promotion: NONE. Production: HOLD. Cleanup: NONE; other A/C/Gemini/QA branches and automation schedules untouched.
- Root disk exhaustion risk and remaining release gates are not waived by this change.

## Final local gate evidence (21:14 KST)

- Root `pnpm test`: security/release/storage checks, 179-route API contract, contract 38/38, database 15 pass / 3 skip, Backend 1,329 pass / 398 skip, Frontend 1,423 pass, zero failures.
- `pnpm lint`: PASS, 0 errors / 1,131 warnings. `pnpm typecheck`: PASS. `pnpm build`: PASS after a frozen-lockfile offline install inside this isolated worktree; the initial attempt using out-of-worktree dependency symlinks failed Next Turbopack's hermetic-root check (environmental setup, not source failure).
- Repository security scan and control-byte check: PASS. Discord bot 8/8 PASS after linking already-installed isolated dependencies; initial run lacked `youtube-dl-exec` in this new worktree.
- `pnpm audit --prod --audit-level high`: PASS, no known production dependency vulnerabilities reported. Full `pnpm audit --audit-level high`: FAIL, 2 critical / 8 high / 11 moderate / 3 low (24 total).
- Official Test exact-SHA, authenticated end-to-end flow, real PostgreSQL app ACL/integration, required GitHub CI and approved GitOps release: **BLOCKED / unverified**. This candidate must remain Draft; do not merge or deploy.
