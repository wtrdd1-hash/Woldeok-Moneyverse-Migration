# A 2026-11-02 14:25 KST — Most-discussed public board QA

Status: **P1 implemented in isolated branch; release HOLD.** Source main a8541927c3a351d980454c66e95a3356c47e0722. PR #2480. No main integration or deployment.

## Scope and behavior
- Public board GET accepts optional sort=recent|discussed; default remains recent.
- Ranking is restricted to the existing latest 50 public posts from public.member_board_public_list_with_stock(50); it is not archive-wide.
- PostgreSQL read is parameterized, with deterministic comment_count DESC, created_at DESC, post_id DESC for discussed. No new migration, table grant, or write.
- Next SSR provides labelled 44px select and scope explanation, noindex for sorted URLs, and fails closed on absent sortApplied.
- Android app-api rejects repeated/unknown sorts (400), stale/forged success payloads (503), duplicate UUIDs, malformed/unsorted posts; filtered responses are no-store/noindex.

## Evidence on code SHA 332ed850be73e06538cc133c1e2aa689e10c86b8
- TDD RED: backend 3 FAIL/19 PASS; frontend 7 FAIL. GREEN: backend 22 PASS; frontend 14 PASS. Additional edge/schema tests added after code SHA.
- Full build PASS; full lint 0 errors/1,027 existing warnings; full typecheck PASS.
- Backend 2,985 PASS / 2 FAIL / 518 SKIP. Failures are pre-existing profile-private-response.http.test.ts expecting 200 but receiving 401, tracked in existing repair PR #2265. Do not claim full backend PASS.
- Frontend 2,936 PASS; database 62 PASS/5 SKIP; contract 41 PASS; security/release policy 34 PASS.
- Initial mobile contract check FAIL (generated documentation drift). Corrective commit explicitly annotates controller return schema and regenerates 184-endpoint Android API contract (posts[] retained, optional sortApplied added). Exact final SHA recheck pending.
- Full dependency audit FAIL: 9 known advisories (1 low, 8 moderate). Production-only dependency audit not yet certified for this final SHA.
- Full-route QA command BLOCKED: repository lacks artifacts/qa/full-route-ledger.json; do not count as PASS.
- DEV PostgreSQL 17.11: READ ONLY / ROLLBACK, SET ROLE moneyverse_app, function EXECUTE true; prepared discussed SQL EXPLAIN PASS. Actual public posts 1; posts with replies 0. Positive multi-row real-data ordering not demonstrated.
- DEV app role account_balances UPDATE true and user_items DELETE true: P0 #993 remains. Production ACL not verified.
- Official Test exact-SHA preflight FAIL: Test still 510dbe6bf4d5c2a8089fc06b480776053da7a2e3, 6 SHA mismatches and public Treasury HTTP 200; official auth E2E and independent restore BLOCKED.
- GitHub Build Test Candidate failed for code SHA because mobile contract generated docs were missing; corrective SHA CI pending.

## Branch and conflict safety
- Audit at 14:33 KST: 230 remote heads including main; 216 non-main unique unmerged, 13 merged; 212 open PRs, 29 conflicting. All unique changes retained.
- Virtual merge conflicts: #2470 (5 files), #2464 (5), #2448 (6), #2474 (1). No forced integration; deleted branches 0.
- No financial/ledger data change, migrations, Production services, Test deployment, rollback, or branch deletion.

## Release decision
HOLD until final SHA CI, zero required tests failed, security audit, DEV/Production ACL, exact-SHA Test authenticated E2E, independent restore, rollback provenance and GitOps release gates pass. This QA document is evidence, not a waiver.
