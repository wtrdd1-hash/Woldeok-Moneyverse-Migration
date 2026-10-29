# A1025 — Verified blog publishing integrity and admin status

## Before work — 2026-10-29 10:29 KST
- Baseline `f018d6300def45572c023c794d909691a2ce9128` from fresh origin/main; dedicated worktree and `auto/hourly-a-blog-publisher-safety-20261029-1025` branch.
- Read AGENTS, README, EN/KO living plan, prior A0925 release hold, QA v1362 and open PRs. Prior QA: 111 non-main branches, 110 open PRs, 46 conflicting; preserve all unique commits.
- P0 regression: current `/api/blog/generate` writes fabricated unverified JSON posts marked PUBLISHED and admin UI falsely claims live publisher. Existing four frontend tests fail on baseline. Existing backend verified-publisher status BFF can be used for real status; never bypass DB-backed verified publisher.
- [ ] Reproduce failing baseline tests and investigate backend status contract.
- [ ] RED/GREEN: retire legacy writer; expose truthful authenticated status and refresh without synthetic posts.
- [ ] Run targeted and full gates; isolate PostgreSQL and check official Test SHA.
- [ ] Re-fetch latest main and plan before any integration; hold unless all gates are proven.

## In progress
Pending.

## Finished
Pending.

### 10:32 KST — baseline reproduced
- Dedicated isolated worktree installed frozen offline dependencies. Targeted Vitest baseline 4 FAIL / 2 PASS (same tests as A0925); evidence `reports/Moneyverse-A-2026-10-29-1025/test/baseline-red.log`.
- Root cause: legacy Next.js publisher generates fixed unverified finance content, stamps `isAiGenerated:false`, `status:PUBLISHED` and a random `verificationReceipt`, and writes to a JSON file; admin UI claims guaranteed automatic/manual publication and can invoke it. The verified backend `publisher-status` controller exists with real status, but UI does not use it.
- Scope: no schema, ledger, auth, deployment, other workers or PR cleanup changes.
