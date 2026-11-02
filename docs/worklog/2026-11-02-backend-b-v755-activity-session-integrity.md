# Backend B v755 — Activity session attribution integrity

## Before work
- [x] Verified Debian 13 miniPC, live service status, remote main and QA v1465.
- [x] Reviewed AGENTS, README, English/Korean planning, concurrent PRs and CI evidence.
- [x] Isolated branch/worktree from exact origin/main; shared main remains untouched.
- [ ] RED regression for activity ingestion on session storage failure.
- [ ] GREEN backend change and focused HTTP/unit tests.
- [ ] Full gates, exact-SHA Test, CI, and release decision.

## In progress
- Pending TDD. A cookie-backed session lookup outage currently falls through as anonymous telemetry, misclassifying provenance instead of reporting an unavailable source.

## Finished
- Pending. No merge, deployment or financial mutation is authorized by this worklog.

### Midpoint — RED/GREEN
- RED: 2/5 expected failures (cookie + session storage outage wrongly recorded as anonymous); three control tests passed. Initial test fixture was corrected to provide a request socket before the valid RED run.
- GREEN: reject unverifiable cookie-backed telemetry with HTTP 503 `ACTIVITY_SESSION_UNVERIFIED`; preserve anonymous no-cookie and verified-actor flows. No schema or financial mutation.
- Backend activity focused tests executed; see internal logs. Official Test, release and all-gates remain HOLD.

## Finished — candidate-only implementation; release HOLD
- **API:** `POST /activity/events` returns HTTP 503 `{code:"ACTIVITY_SESSION_UNVERIFIED",message:"Activity session verification is unavailable"}` when a request includes an authentication cookie but its session store is unavailable or the lookup throws. No telemetry row is recorded. No-cookie anonymous events continue as 200; verified actors use only server session identity. Invalid-but-confirmedly-absent session stays anonymous; no actor is fabricated.
- **DB:** No migration, grant, ledger, audit or financial mutation. PostgreSQL 17.11 isolated scratch database: 322/322 source migrations applied; 54 integration PASS, 2 SKIP; app balance UPDATE denied and ledger posting DELETE denied in scratch only. Production ACL and 5 migration checksum mismatches from QA v1465 remain unresolved.
- **TDD:** RED 2 expected FAIL / 3 PASS; GREEN focused controller+HTTP+guard 8 PASS. Initial RED fixture error corrected before valid RED evidence. HTTP fixture originally lacked admin guard providers; corrected before final HTTP pass.
- **Exact candidate local gates:** Backend NODE_ENV=test 2,986 PASS / 518 SKIP. Backend NODE_ENV=production 2,984 PASS / 2 FAIL / 518 SKIP (pre-existing profile-private-response 401 vs 200, #2265). Frontend 2,922 PASS. Contract 41 PASS; database package 62 PASS / 5 SKIP; app-api 184 endpoints/683 methods PASS. Lint 0 errors / 1,027 warnings; typecheck PASS; backend and frontend builds PASS; security/release/backup policy 173 PASS. Production dependency audit 0 advisories; full audit 9 (8 moderate, 1 low).
- **Verification caveats:** No official Test exact-SHA backend/API/DB/auth/browser/mobile E2E or independent off-host restore. Existing QA v1465 Production HTTP 500, DB ACL/checksum drift and Test DB mapping remain P0. No Production promotion or main merge is authorized. The new activity behavior is candidate code only, not deployed.
- **Coordination:** Separate branch/worktree from origin/main; existing A/C/QA/Planning PRs reviewed; no overlap with their changed paths. Shared main `implementation_plan.md` modification and all other worktrees preserved. No branch cleanup.
- **Release:** DRAFT / HOLD, main merge NONE, Test deployment NONE, Production deployment NONE, existing automations untouched.
