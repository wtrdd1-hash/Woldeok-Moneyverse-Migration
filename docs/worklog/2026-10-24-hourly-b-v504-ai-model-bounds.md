# B v504 — Bounded external AI model responses (P1 / release HOLD)

## Before work
- 2026-10-24 12:05 KST: miniPC status/shell/file MCP invoked. Debian 13.6 and services active; file MCP returned empty object; read canonical files via shell.
- Start origin/main: `49788d09494fed3e463651945b83386e87dd47bc`. Independent branch `auto/hourly-b-ai-response-bounds-v504-20261024-1205` and worktree `/home/debian/worktrees/mv-b-v504-20261024-1205`.
- Read AGENTS.md, README.md, EN/KO project plan, QA #1114, active A/C/B PRs and CI. No overlap with P2P #1117, wallet A #1115, search C #1116, QA #1114.
- P1 issue #1073: backend Zod is already patched to 4.6.7 on main, but external AI model JSON response has unbounded `response.text()`, unbounded scenarios/choices/model collections. Fix remaining input-size/cardinality limits without changing financial authority, DB, frontend or migrations.
- Release HOLD: main still has QA test/security failures; official Test exact-SHA, shared Production/dev DB and port 5433 are not safe for mutation.

## In progress
- [ ] Write regression tests for oversize model payload and scenario collection (RED).
- [ ] Implement bounded streaming response and Zod collection cardinality (GREEN).
- [ ] Run focused + full gates, review latest main and planning, push Draft PR.

## Finished
- Pending. No merge or deployment authorized.

### Mid-task checkpoint (2026-10-24 12:04 KST)
- RED: three focused regressions failed on main behavior (oversized JSON body, 21 scenario proposals, 1,001 model entries). Evidence: internal `red.log`.
- GREEN: same three focused regressions passed after bounding response bytes (256 KiB streaming, abort on overflow), scenarios (20), completion choices (4), content segments (32), model IDs (1,000). Evidence: internal `green.log`.
- No DB/API route/financial ledger changes; upstream AI response contract rejects oversized data with existing `ai_news_model_unusable` code.
- Worktree dependency install used `pnpm install --offline --frozen-lockfile --ignore-scripts`; no Production/dev database changes.

## Finished — 2026-10-24 12:09 KST (PARTIAL / BLOCKED)
- Focused final tests: 59/59 PASS (AI model service 54 + controller guards 5); new RED->GREEN tests 3/3 PASS.
- Full backend local: 1,316 PASS / 398 SKIPPED (no shared database writes); database package: 15 PASS / 3 SKIPPED.
- Full frontend local: 1,395 PASS / 5 FAIL (three stale SEO assertions, Vietnamese locale expectation, login touch-target class expectation). QA #1114 and A #1099 own those files; no overlapping edits.
- Repository lint: exit 0, 0 errors / 1,137 warnings. Typecheck exit 0; full build exit 0; API contract check exit 0.
- Production dependency audit: FAIL (2 High, body-parser GHSA-27r3-jxmh-p828 and multer GHSA-q7qp-rjg7-q26m); not fixed here to avoid overlapping A security changes.
- GitHub Draft PR #1118: CI #40057015861 and Build Test Candidate #40056820069 were running at checkpoint; do not treat pending as PASS. Re-evaluate final SHA checks.
- Start/mid/end main SHA: `49788d09494fed3e463651945b83386e87dd47bc`; EN/KO plan rechecked; no rebase required as main did not advance.
- Official Test `/api/version` reported `6f697e74b7bf0cd1e4521d36534cfd9c140f8010`, not this branch SHA. Official Test exact-SHA, authenticated AI console E2E, isolated real PostgreSQL, finance/security integration and GitOps gates BLOCKED/NOT VERIFIED.
- DB schema/migrations, ledger, auth, app-api routes, production data, live services and feature flags unchanged. No merge, Production promotion, rollback or branch deletion; unmerged unique work preserved.
- Five core A/B/C/planning/QA automations checked enabled, no schedule mutation.
- API behavior: existing AI model console route/error codes unchanged; untrusted oversized model response now fails closed as `ai_news_model_unusable`. Data model/DB contract unchanged.
- Remaining blockers: frontend five failures, High dependency advisories, shared Production/dev DB and exposed port, migration266 drift, exact-SHA Test mismatch and incomplete authenticated E2E. Keep PR Draft and Production HOLD.

### Verification matrix
| Gate | Status |
| --- | --- |
| Backend focused RED->GREEN | PASS |
| Backend full local | PASS with DB skips |
| Database package | PASS with skips |
| Lint/typecheck/build/API contract | PASS (lint warnings) |
| Frontend full | FAIL (5) |
| Production audit | FAIL (2 High) |
| Real PostgreSQL integration and authenticated E2E | BLOCKED |
| Exact-SHA official Test | BLOCKED |
| GitHub CI and release approval | PENDING / NOT PASS |
| Merge / Production / cleanup | NOT PERFORMED |
