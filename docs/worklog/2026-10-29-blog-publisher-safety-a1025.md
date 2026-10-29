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

### In progress — 10:42 KST
- Baseline four failed tests reproduced; now targeted verified route, admin UI and backend BFF 11/11 PASS, full frontend 1912 PASS, backend 2206 PASS / 406 SKIP, database 46 PASS / 4 SKIP, API contract 38 PASS, release Node 32 PASS.
- Real isolated PostgreSQL 17.11: 292 numbered migrations (002–293) applied. First full test run used privileged migrator URL and produced 56 false privilege failures; corrected test DATABASE_URL to `moneyverse_app` with a distinct app password and re-ran entire suite successfully. No live DB touched.
- Lint 0 errors/1092 warnings, security audit 0 high/critical (1 moderate). First Next production build failed because optional GET request signature is incompatible with Next generated route types; corrected to required Request. Bot tests initially blocked by missing isolated bot dependencies; installing independently.
- Refreshed main mid-run, unchanged `f018d6300def45572c023c794d909691a2ce9128`. EN/KO plan still v1448. Existing PR #1807 safety gate remains Draft.

### Finished — 2026-10-29 10:49 KST (candidate source validated, release HOLD)
- [x] Baseline RED 4/6 reproduced; legacy JSON writer retired with 403/503, no forged review or disk write.
- [x] Admin status reads authenticated backend BFF and exposes accessible refresh/pending/error state; no fake manual publish.
- [x] Targeted 11 PASS; full `pnpm test` with isolated `moneyverse_app` URL PASS (backend 2206 PASS/406 SKIP; frontend 1912 PASS; DB 46 PASS/4 SKIP; contract 38 PASS; Node 32 PASS). Real isolated PG 17.11 migrations 002–293 PASS.
- [x] Lint 0 errors/1092 warnings, typecheck/build PASS, release Node 82 PASS, app-api/SEO/a11y 51 PASS, mobile contract 180 endpoints PASS, bot 11 PASS, security audit high/critical 0, moderate 1.
- [x] Re-fetched main at start/mid/pre-integration; still `f018d6300def45572c023c794d909691a2ce9128`, EN/KO plan v1448. QA v1362 and release guide reviewed. Cross-PR overlap with #1817 documented; this focused repair does not include migration 294.
- [ ] Official Test exact SHA authenticated user/backend/DB/E2E, finance provenance, DB privilege/migration parity, off-host restore, GitHub CI candidate image and Production smoke are NOT certified. No merge or deployment authorized.
- Latest branch inventory 114 non-main / 113 open PR, 0 head mismatches or duplicates, 0 deleted/closed by A1025. Previous 111 non-main / 110 PR at start. Preserve all unique work.
- Development checkpoint `d68351d512bfb81975acd3bd73beb564d94283c1`; final documentation checkpoint SHA to be recorded after push. No live rollback triggered; no Test/Production changes.
- Independent reports: `/srv/moneyverse-data/reports/Moneyverse-A-2026-10-29-1025/QA-RELEASE-HOLD.md` and `.ko.md` (test logs in `test/`).
- This is a P0 integrity repair, **not** a new end-to-end member feature completion.
