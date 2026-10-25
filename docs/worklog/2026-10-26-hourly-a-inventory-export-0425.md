# Development A — verified private shop upkeep exposure CSV (2026-10-26 04:25 KST)

## BEFORE WORK
- Debian 13.6 mini-PC MCP status: backend/frontend/Discord/MCP/nginx/docker ACTIVE; PostgreSQL connected. Root filesystem 99% used, data volume 70%. Do not deploy or restart services.
- Source of truth: origin/main 1c5b84a1c45baafcca83f375a6f99698121e9bb5. Worktree/branch: auto/hourly-a-inventory-snapshot-export-20261026-0425, created from main. No other worktree modified.
- GitHub initial snapshot: 219 remote heads, 215 open PRs. Existing QA, AGENTS.md, README.md, docs/planning/PROJECT_PLAN.md, PROJECT_PLAN.ko.md and INTEGRATED_PLANNING_MASTER.md reviewed; open A/B/C and QA PRs retained. Do not delete any branch with unproven unique history.
- Known baseline failures from prior A runs: six frontend tests (SEO/i18n, login a11y, calculator signup, M2 telemetry); security audit Critical/High; Test exact-SHA and authenticated E2E unavailable. These are release blockers.
- Initial P1 candidate was a complete inventory CSV, but this was superseded after exhaustive PR review by a **distinct verified shop upkeep exposure CSV**: weekly upkeep, arrears due/cap, unpaid weeks, suspension, as-of time. Existing owner-scoped shop_my_items_v2 reused, no migration, ledger writes or extra grants. Fail closed above 100 relevant holdings or malformed amounts.
- Correction: the initial recent-50 PR scan missed existing generic inventory export Draft #1299. Exhaustive review of all open PRs identified it. The generic feature was discarded; current upkeep/arrears snapshot is distinct from #1299, C #1176 and B/C/QA work. Both existing PRs remain untouched.
- Release policy: all full gates, isolated real PostgreSQL owner/ACL and exact-SHA authenticated official Test E2E required before merge or Production. Any failure => HOLD.

## IN PROGRESS
- [x] RED tests: backend 3 failed (missing exportSnapshot), frontend module import failed (missing route). Evidence /srv/moneyverse-data/reports/a0425-{backend,frontend}-red.log.
- [x] Generic export TDD completed, then superseded by distinct upkeep/arrears feature after duplicate discovery. New upkeep TDD RED backend 5 failures / frontend module missing; GREEN backend 18 PASS and frontend/Android 21 PASS. Privacy allowlist TDD RED 1, GREEN backend 19 PASS.
- [x] Mid-work origin/main re-fetched (unchanged 1c5b84a1), integrated EN plan reread; conflict PRs #1107/#1110/#1143 preserved.
- [x] Real isolated PostgreSQL 17.11, 281 migrations, app role owner upkeep 1 / foreign 0; no raw user_items SELECT/INSERT or ledger INSERT; exact money fields; ROLLBACK, 0 fixture rows remain.
- [x] Full pre-report gates: typecheck PASS (after stale .next removal), lint PASS (0 errors/1128 warnings), build PASS, contract 38 PASS, DB 15 PASS/3 SKIP, backend 1319 PASS/398 SKIP, frontend 1408 PASS/6 FAIL (SEO 3, login a11y, calculator CTA, admin M2). Bot 8 PASS; production audit 2 High, full audit 2 Critical/10 High, bot audit 1 Critical/5 High.
- [ ] Final exact SHA CI/official Test/Production gate; release HOLD.
- [x] Full PR overlap/conflict audit, no branch deletions, Draft PR #1367, EN/KO release and QA evidence.
- [ ] Final exact SHA gate and GitHub PR comment.

## FINISHED
- Source-only implementation candidate: verified **current upkeep exposure**, not generic inventory CSV, payment receipt or debt settlement. All financial fields remain canonical integer strings, no financial writes.
- Initial 219 remote branches / 215 open PRs; latest audit 221 branches / 217 PRs (other workers concurrent), conflicts #1107/#1110/#1143 protected; zero branches deleted; unique unmerged changes retained. Duplicate tip SHAs 0, not a proof of patch equivalence.
- Main start/mid/pre-release: 1c5b84a1c45baafcca83f375a6f99698121e9bb5 unchanged; English original/Korean secondary integrated plans rechecked. Official Test /api/version 6f697e74b7bf0cd1e4521d36534cfd9c140f8010 and Production 6a989b5ac0c6155587d43426d64f6def6b62c917; neither candidate.
- No main merge, Test promotion, Production GitOps, service restart, production DB write, ledger mutation or branch cleanup. Rollback: revert only feature source if authorized; no DB rollback. RELEASE HOLD.
- Full final SHA checks and end counts are recorded in Draft PR #1367 comment to avoid a self-referential commit SHA in this file.
