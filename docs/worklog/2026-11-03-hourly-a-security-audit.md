# Development A — Dependency audit P0/P1 release blocker (2026-11-03)

## Before changes (07:26 KST)
- Isolated worktree `auto/hourly-a-20261103-0725-security-audit`, based on `f5c3fbedae1c3b3ec2374882b049aac43a655eb4` (recheck at integration).
- Read AGENTS.md, README.md, EN/KO integrated plans, latest QA/worklog, current CI, PR and branch inventory. No main edits, no DB/migrations or production writes.
- Baseline `pnpm audit`: 9 vulnerabilities (1 low, 8 moderate), including brace-expansion 1.1.20/5.0.11, @vitest/mocker, minimatch, deepmerge; existing overrides pin vulnerable brace-expansion versions.
- Scope: remediate compatible transitive dependency versions with isolated lockfile changes; test audit, typecheck, build, lint, unit/integration and package contracts. Deepmerge has no patched version: do not claim full audit PASS unless independently proven.
- Prior release HOLD: production locale /ko and /en HTTP 500; disk 97% used; official exact-SHA Test, independent restore and auth E2E unverified; PR #2552 existing locale repair, #2265 existing profile repair. Avoid duplicating them.

## Checklist
- [x] Baseline audit and conflicting PR survey.
- [x] RED baseline audit evidence (9 findings) and minimal dependency override patch.
- [x] GREEN targeted regression, typecheck, contract, DB units, backend build; full mandatory gates attempted but TIMEOUT/BLOCKED.
- [x] Mid-run main and English/Korean plan recheck, QA/release HOLD; final SHA and PR counts in PR evidence.
- [x] Draft PR #2587 opened; CI observed running, do not merge.

## Mid-run (07:27–07:36 KST)
- Changed root brace-expansion override 1.1.20/5.0.11 -> 1.1.21/5.0.12 and Vitest in backend/frontend/contract/database 4.1.11 -> 4.1.12; regenerated lockfile. Security floor test updated. No feature functionality claimed.
- `pnpm audit`: 9 -> 3 findings; residual minimatch 2 moderate, deepmerge 1 low. `pnpm audit --prod`: 0.
- Typecheck PASS, security 3 PASS, DB 72 PASS/5 SKIP, contract 41 PASS, focused Backend 8 PASS, focused Frontend 8 PASS, Backend build PASS, Android API contract 184 PASS.
- Full Backend/Frontend tests separately TIMEOUT at 105s; frontend build TIMEOUT after generating 602 pages and while collecting traces; full lint incomplete. None counted as PASS.
- Main rechecked `f5c3fbedae1c3b3ec2374882b049aac43a655eb4` unchanged. Planning v1686 Draft #2585 is unrelated support-resolution work.
- Remote refs at checkpoint: 330 branches, 300 open PRs, 29 conflicting. No deletion: all unique unintegrated work preserved.
- Production `/ko` and `/en` HTTP 500, Test `/ko` 200. Official exact-SHA Test, DB security, E2E, restore and release gate BLOCKED. No Test/Production or DB mutation.
- Evidence: `/srv/moneyverse-data/tasks/mv-a-20261103-0725-security-audit/evidence/`.

## Final checkpoint (07:46 KST)
- Code SHA `0b8863a7d5ae4f5d8efb05145b37f58996706579` passed security floors, typecheck, backend/frontend builds, contract, DB tests, full frontend suite, and full lint (0 errors, 1026 warnings).
- Backend full: 2983 PASS / 2 FAIL / 518 SKIP (existing profile 401 vs expected 200; Draft repair #2265). Frontend full: 2947 PASS / 0 FAIL with required `NODE_ENV=test`. Earlier ad-hoc invocation without NODE_ENV produced invalid-mode React.act failures and is not the canonical result.
- `pnpm audit` remains FAIL with 3 findings; no attempt to override incompatible minimatch majors or unpatched deepmerge. No end-to-end member feature completed.
- Remote heads before new branch: 330; after: 331. Open PR before: 300; after Draft #2587: 301; conflicting 29. Remote-tracking refs include origin/HEAD symbolic alias; 17 ancestor branch refs (plus origin/HEAD alias) require PR/owner checks before deletion, so deleted 0, preserved all 330 pre-existing branches plus new branch.
- Changes: root package.json, pnpm-lock.yaml, backend/frontend/contract/database package.json, security floor test, EN/KO QA, release HOLD and worklog. No database schema, privilege, ledger, service, Test or Production mutation.
- Main unchanged at `f5c3fbedae1c3b3ec2374882b049aac43a655eb4`; planning Draft #2585 concerns support status, no overlap. No merge or rollback performed.
- Official Test exact candidate SHA, auth/user flow, independent restore and GitOps release gate NOT RUN/BLOCKED; production locale HTTP 500 persists. Production HOLD.
- After this documentation checkpoint, a new final commit SHA will be recorded in PR evidence; CI must be checked against that exact SHA.
