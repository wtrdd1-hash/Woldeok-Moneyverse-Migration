# Development A — owner-only virtual bond holdings export (2026-10-25 21:25 KST)

## Before work
- Source main: `1c5b84a1c45baafcca83f375a6f99698121e9bb5` (fetched). 189 remote branches, 185 open PRs; do not delete unique tips.
- Host Debian 13.6; backend/frontend/nginx/docker active; root disk 98%, data disk 63%.
- Read `AGENTS.md`, `README.md`, canonical English `docs/planning/PROJECT_PLAN.md`, secondary Korean `docs/planning/PROJECT_PLAN.ko.md`, integrated planning, recent QA #1317 and planning #1329, open PRs/CI. Root `PROJECT_PLAN.md` does not exist; plans live under `docs/planning/`.
- Scope: P1 owner-only **current virtual bond holdings** CSV export. Existing `bank_get_my_standing(actor)` is owner-scoped, SECURITY DEFINER, and returns only `status=holding` bonds; no historical redeemed holdings or guaranteed settlement claim. No ledger writes, no migration.
- Assumption for delegated non-interactive run: implement a bounded, fail-closed, authenticated export with source provenance, exact integer strings, CSV injection protection, Android app-api parity. Other developers' changes remain untouched.
- Plan: (1) RED tests for backend holdings read, CSV serialization, gateway contract; (2) implement Nest GET and owner-scoped DB function reuse; (3) Next CSV route and bank link; (4) GREEN tests; (5) full gates, real isolated PG, CI and release HOLD decision. Never merge on red.

## In progress
- Worktree `auto/hourly-a-bond-holdings-export-20261025-2125`, isolated from main and all other tasks.

## Finished
- Pending exact-SHA verification and gate evidence.

### Midpoint checkpoint (2026-10-25 21:31 KST)
- Re-fetched main and canonical EN/KO planning. No newer main than initial SHA at checkpoint.
- TDD RED: backend 4 failures (missing method); frontend formatter and route import failures (missing files). Logs stored under `/srv/moneyverse-data/worktrees/hourly-a-bond-holdings-export-2125-red-*`.
- GREEN: backend 4/4; frontend formatter/route/Android app-gateway 21/21. Real owner `bank_get_my_standing` function reused; no migrations or balance mutation.
- Source changes: bank repository+controller, member banking link, private Next CSV route and validator; app-api/v1/banking/bonds/holdings uses the existing native proxy and session forwarding.
- Next: full gates, isolated PostgreSQL, exact-SHA CI, and Test identity. Production HOLD until independently verified.

## Finished — source implementation / release hold (2026-10-25 21:40 KST)
- Implementation SHA before reporting: `f43b1400525a17c421c1ef55912871914ef25baf`. Draft PR #1331.
- Source/tests: 12+ changed files; owner-scoped bank holdings endpoint, Next private CSV route, bank UI, native gateway contract tests and read-only PostgreSQL function reuse. No migration/ledger write.
- Focused GREEN backend 6/6 and frontend 32/32; Typecheck PASS, Lint PASS (0 errors/1128 warnings), Build PASS. Full frontend 6 FAIL; dependency audit prod 2 High/full 2 Critical+10 High, bot audit 1 Critical+5 High. Bot test 8 PASS after install. Full exact final SHA rerun required; PR comment to record.
- Isolated `wdmv_v761_test_acl` (281 migrations): app role function EXECUTE YES, direct bonds SELECT NO, ledger INSERT NO; rolled-back one-bond fixture visible to owner and zero persisted.
- Before final integration main and canonical EN/KO plans re-fetched; main unchanged. Remote branches 189 -> 190, PRs 185 -> 186; no identical tips/trees/last patches; all 189 non-main tips unmerged, 0 deleted; conflicts #1107/#1110/#1143 preserved.
- Official Test SHA `6f697e74b7bf0cd1e4521d36534cfd9c140f8010`, Production SHA `6a989b5ac0c6155587d43426d64f6def6b62c917`; candidate differs. No exact-SHA authenticated Test E2E. GitOps/Production release HOLD. Rollback: no deployment or migration occurred, so no runtime rollback action needed.
- System Debian 13.6 active; root disk 98%, data disk 63%; no restart, no other branch/worktree modification. Other scheduled development remains untouched.
