# v2026.10.17.753 — Real Test repair and Production release worklog

**English canonical** | [한국어](2026-10-17-release-blockers-v753.ko.md)
**Started:** 2026-10-17 around 02:19 KST. **Starting main:** c2d4667b44c0222ed422cea2a59626a0a318face.
**Isolated worktree:** fix/release-blockers-v2026.10.17.753, /srv/moneyverse-data/build-workspaces/release-blockers-v2026.10.17.753.
**Status at completion:** Actual Test promoted/verified; Production not promoted due financial release gate.

## Before work
- Re-fetched latest main, authoritative PROJECT_PLAN and INTEGRATED_PLANNING_MASTER, documentation policy, v713 P0, v744/release logs and Test/Production deployment runbook. Existing draft finance PR #892/#898/#871 preserved.
- Original Test v735.2 SHA 9618a2499328d207c9e34b969f6aa96121331749 on Test DB woldeok_moneyverse_v506_test, 246 historical migration rows. Prod v717 SHA 176ca04ecfbd673e7f1057cdf83a9b92ea8f8272 on different DB. Root disk initially ~83% used, separate data disk ~56%.
- Created isolated worktree and beginning record before any database snapshot or host changes.

## Intermediate actions
1. Discovered original Test lacks monetary policy/PvP modern tables, Test public arena GET 500. Three old Test migrations 243/244/245 share numbers with distinct current canonical production migrations. Test financial preflight narrowly green does NOT imply schema readiness.
2. Generated two protected pg_dump Test backups: first no-ACL trial failed app SELECT, and source-preserving ACL/ownership backup. Restored Test DB into separate clone. Repaired legacy same-signature function parameter collision using DROP FUNCTION RESTRICT only in clone after verifying no dependencies. Applied canonical 243/244/245 and 248–272 SQL. Recorded three supplemental valid source names without overwriting old names; 271 canonical SHA256 verified, 3 extra old names. Full Test data account_balances 60 and auth_sessions 96 were byte-digest matched with the original.
3. New Test clone app-role finance-readiness READY_FOR_OTHER_RELEASE_GATES, with zero protected direct finance DML and zero ledger projection differences. Exact source Nest/Next/contract compiled, source c2d SHA and build ID verified. Staged immutable Test on second disk.
4. 02:40 KST first Test cutover to staged release failed due omitted built @moneyverse/contract module; rollback trap restored old symlink, both Build ID release env and Test services; Test v735.2 healthy again. Built contract from source in immutable stage, verified runtime canary from stage itself and ensured scheduler disabled.
5. 02:43 KST retried and published Test release successfully. Public exact backend/frontend SHA, 11 anonymous routes five times (55/55), PvP read 200, anonymous creation 401, public noindex, /health 200 and Test finance and release identity passed. Old Test DB, immutable release and env rollback preserved.
6. The GitHub Build Production Release gate first failed because candidate run 38940522540 belonged to an auto branch, not main. Resolved to actual main Build Test Candidate run 38938140942, then official Production image workflow 38942314503 PASSED preparation, Test gate and backend/frontend image builds.
7. READ ONLY Production finance investigation: 19/40 unmatched projections totaling +4,779,188 WLD, USER_CASH 18 (+4,772,938) and SINK 1 (+6,250). Five unposted USER_CASH accounts +2,627,807. Anomalies largely tied to October 8 last balance updates, but evidence-bearing bulk payout, work receipt and p2p tables do not certify sources. Protected money tables 5 still app role directly writable; no fabricated correction. Protected PostgreSQL 17.11 full current Production snapshot taken (83MB archive), archive TOC verified, data not altered.
8. During Test follow-up crawling, SeoService logged permission-denied warnings for seo_crawler_logs writes; separate noncritical-but-real bug for least-privilege code repair. Real authenticated member/admin 5-pass QA remained unverified.

## Completion and scope
- **Completed:** Test schema and permission lineage recovery in separate DB; real public Test backend/frontend cutover to c2d SHA; rollback exercised; exact Test public APIs/guest smoke; role financial check; main CI/Test attestation and production **image** build; protected Test and Production database snapshots.
- **Not completed:** Proven Production ledger provenance of 19 balances, 5 app raw money DML grants and replacement of nonledger financial writers, all-route authenticated Test QA, existing 2FA/session proof, zero-downtime Prod cutover. Actual public Production remains v717 and must not be called promoted.
- No Production database values, WLD supply, grants, migrations, feature switches, release symlink, Nginx or currently running service changed.
- Mid-work main re-fetched and unchanged; ensure final main state, PR CI and branch cleanup documented by verified GitHub PR comment rather than invented in this premerge worklog.

## Final runtime identity cross-check
- After a public Test DB-backed PvP GET returned HTTP 200, the Test PostgreSQL cluster reported 2 live connections to the upgraded wdmv_v753_test_acl DB and 0 to original woldeok_moneyverse_v506_test. Operator-only DB selector file has mode 0600 and is listed last in the active backend systemd EnvironmentFiles. This ties public Test SQL to the upgraded DB rather than merely naming it in offline checks.
- Wrong non-ACL temporary test clone and copied temporary container SQL/dump objects removed; active upgraded Test database, v735.2 rollback, original v506 Test database, full Test pre/post database archives and protected Production dump were all preserved.
