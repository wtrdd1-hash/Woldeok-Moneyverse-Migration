# Backend B v655 — exact runtime CI release gate (P0 #1979)

## Before work
- Source: QA v1386 / issue #1979. Production v1515 switched before exact-source CI runtime-check finished, while official Test was still on an older SHA. This change guards the GitHub `deploy.yml` path only; out-of-band systemd release tools remain outside this enforcement boundary.
- Starting origin/main: `a7f8730b9838b9324b6ece25e394dfcc8709aadf`. Independent `auto/hourly-b-v655-exact-ci-release-gate-20261030-1035` worktree.
- Reviewed AGENTS.md, README, both project plans, open Draft PRs #1974/#1975/#1978, QA v1386, issue #1979, CI and candidate/deploy workflows. Avoid duplicate work with QA's docs-count repair #1978.
- Plan: RED/GREEN exact-SHA, main-push CI and completed runtime-check success gate; enforce before Test/Production release stages; guard main movement during Test polling and before registry access.

## In progress
- TDD RED: missing module then missing main-movement recheck; GREEN: 9 focused assertions including actual workflow shell exercised with mocked GitHub API for skipped vs successful runtime job.
- Real GitHub read-only reproduction: source `0669f0f64fea1c70235760d1949f90446b6964f7` CI run 40981988261 rejected (FAILED); current main CI run 40982575372 rejected despite overall SUCCESS because `runtime-check` was SKIPPED.
- New `scripts/release/verify-exact-runtime-ci.mjs`: require exact current main SHA, latest main push CI completed SUCCESS and exact job `runtime-check` completed SUCCESS, reject skipped/failed/unfinished, stale SHA/branch/PR and incomplete job pagination. Workflow checks main before candidate artifact retrieval, after Test polling, and before Production registry access.
- No application API/DB contract, migration, financial ledger, balance, secrets, or runtime service change.

## Finished — candidate HOLD
- 9/9 focused tests; release suite 105/105 before final shell test (final rerun required); security tests 17/17; contract unit 41/41; DB static 56 PASS / 4 SKIP; Typecheck PASS; Backend Build PASS; full lint 0 errors / 1043 warnings; Frontend Build PASS on retry after transient Next Google font loader failure; production dependency audit PASS (no known vulnerabilities).
- Full Backend: 2559 PASS / 119 FAIL / 495 SKIP. Full Frontend: 2604 PASS / 53 FAIL. `pnpm api:contract:check` FAIL due EN/KO generated endpoint count drift (183 generated vs 182 committed; QA Draft #1978 handles it). Generated docs restored in this worktree; no duplicate docs fix.
- Official isolated Test exact-SHA, authenticated app-api/finance/security E2E, independent restore, Production promotion: **BLOCKED / NOT RUN**. No production release or main merge. A workflow-level gate cannot stop manual/out-of-band systemd switches; P0 #1979 remains unresolved.
- No cleanup of any other worker's branch, worktree, service, backups or scheduled automation.