# Planning v1672 — F675-224 Administrator-Only Related Support Cases

**Date:** 2026-11-03 KST. **Cycle:** Previous Feature Improvement v1670 / Current Feature Addition v1672 / Next Feature Improvement v1674 (provisional). **Status:** DRAFT / RELEASE HOLD / NOT IMPLEMENTED.

## Source and duplicate avoidance
- miniPC Debian 13.6 system status active, DEV PostgreSQL 17.11 read-only 3 support threads/6 messages, 268 public tables, app-role account balance UPDATE TRUE. Migration 196, Nest support controller/repository, admin Next view inspected. No related-case schema/API/UI in source.
- Github issue #1493 already covers operator-only private support notes F675-143; did not duplicate it. Existing canned responses also not re-planned. New related-case linking is separate and explicitly non-merging.
- GitHub main `9cade11af53db9f27c2b9f0ea9d39005ea8d0387` checked at start and mid. Prior unmerged Draft #2544 / head b4c54c7d2ffcb55bebeb817c247946cb7352ec85 preserved; planning branch is stacked and isolated. Latest QA v1475 at 23:46 KST FAILED/P0, Production release HOLD. Root disk 89%; no cleanup of other agents' worktrees.

## Scope, engineering and acceptance
See the same detailed EN/KO section in PROJECT_PLAN and INTEGRATED_PLANNING_MASTER: admin-only same-member related-case panel, 20-link limit, bounded same-owner candidate lookup, non-destructive link/unlink, strict role+ownership checks in SQL, canonical pair PK, CAS/immutable receipts, audit, role-revoke/erasure locks, privacy/noindex/no-store, mobile member denial, accessible admin UI, anonymized k>=20 KPI, feature OFF, 10,001 synthetic records and 100x race/abuse tests. P0 4 / P1 6 handed off in [issue #2548](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/2548).

## Evidence gates and release
- QA v1475: Production localized 16/28 HTTP500; app TRUNCATE 213/264, UPDATE 195/264, DELETE 194/264; 5 migration checksum mismatches, Test DB mismatch, backend production-mode 2 FAIL, full audit 9 advisories. No exact-SHA official Test E2E or independent off-host restore.
- External independent references: **0 newly accepted**, cumulative verified/deduplicated/classified **UNKNOWN / 10,000**; **BLOCKED / IN PROGRESS**.
- Documentation-only: no runtime, DB schema/data, items, WLD, ledger, Test/Production deploy, main merge, service restart or automation mutation. Final verification, remote CI and GitHub update evidence to be appended after execution.

## Local verification / 로컬 검증
- 2026-11-03 KST: read-only documentation/policy suite **188/188 PASS**, release classifier **24/24 PASS**, repository security scan **PASS**, EN/KO plan-master exact paired sections **PASS**, git diff --check **PASS**. Runtime and acceptance E2E **NOT RUN**; official Test and Production **NOT DEPLOYED**.
