# Development A — Recent wallet transaction receipt (02:25 KST)

## Before work
- Base `origin/main`: `54d5140ddb49dd3e2193a2f82b71a6a0a57cfede`; branch `auto/hourly-a-wallet-receipt-20261024-0225`, isolated worktree.
- Remote branches: 24 (23 non-main); open PRs: 23. All non-main heads retain unmerged commits. No branch cleanup authorized by evidence.
- Reviewed AGENTS, README, English PROJECT_PLAN and Korean secondary, integrated plan, F675-03 receipt spec, existing wallet service/repository/controller and pending A/B/C/QA PRs.
- Other pending A PRs #1023/#1026/#1034/#1040/#1044 are preserved; no cherry-pick, overwrite or auto-merge.
- P1 gap: members cannot open a private receipt for one of their recent ledger movements. The existing owner-scoped wallet query returns only the latest 50; this slice will **not** claim lifetime coverage.
- Production hold: CI/security, app-role DML, migration parity, authenticated exact-SHA Test and rollback remain unresolved.

## In progress
- [x] TDD RED for owner-bound receipt, unknown/malformed UUID, 38-digit precision, zero-net bank movement and bounded recent history.
- [x] Backend receipt API uses the already owner-filtered recent ledger projection, no direct SQL privilege expansion or migration.
- [x] Frontend detail and activity link, noindex/no-store, truthful limit and unclassified reason, exact signed pockets.
- [x] Android app-api route/response privacy and auth forwarding regression.
- [ ] Recheck origin/main and planning before integration; full tests and CI evidence.

## In-progress evidence (02:33 KST)
- Backend RED 4/4 missing-method failures; GREEN receipt service 4/4, controller 3/3, route/auth 23/23.
- Frontend RED missing receipt module; GREEN receipt formatter 3/3 and native app-gateway route/precision 2/2.
- Exact 38-digit signed WLD retained. Existing SQL owner-filtered recent query reused, no migration or new DB privilege.
- Real development PostgreSQL read-only sample: same-owner receipt posting count 1; unrelated-owner posting count 0; ledger 877 transactions / 1784 postings; app INSERT still permitted on 235 tables (P0 HOLD).
- Typecheck PASS; whole lint FAIL on existing `frontend/src/app/wallet/export-ledger-csv.tsx:19` `no-control-regex` (QA PR #1021 owns that change). Changed-file ESLint: zero errors.
- Main rechecked unchanged `54d5140d`; planning v1186 still a draft; no merge/release authority.

## Finished
Pending full gates and CI.
