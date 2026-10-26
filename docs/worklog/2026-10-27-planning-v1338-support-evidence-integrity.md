# Planning v1338 — F675-141 Private Evidence Retrieval and Legacy-Media Integrity
Date: 2026-10-27 Asia/Seoul. Status: PARTIAL / DRAFT / RELEASE HOLD.
Previous: Feature Addition v1336. Current: Feature Improvement v1338. Next: Feature Addition v1340 (provisional).
Main SHA: 0fe614b2ca1a7bc0df540514e54db78130479e2a (rechecked at start and mid). Stacked predecessor Draft #1476, engineering issue #1475. Branch docs/planning-v1338-support-evidence-integrity.
Skills: skills__list returned no URI; repository-installed using-superpowers, brainstorming, writing-plans, using-git-worktrees, verification-before-completion read; planning-only, no implementation approval inferred.
Evidence: backend chat media GET lacks auth and returns public immutable; ChatImageStorage URL not owner-bound; support and direct chat use same upload; ChatMessageRenderer uses URL img/new tab; Next.js App API response header allowlist omits nosniff/referrer/vary/CORP. No Production privacy incident asserted.
Design: typed evidenceId, owner/admin read, credentialed Blob viewer, legacy unverified, HEAD/Range/304 auth, private headers through gateway, idempotent receipt, GC/attach race, AV/re-encode/EXIF, encrypted restore, mobile/a11y/SEO/KPI and flag OFF. No new distributed feature spec.
Backlog: ENV1338-01 SEC1338-02 REL1338-03 SUP1338-04 SUP1338-05 SUP1338-06 SUP1338-07 SUP1338-08 SUP1338-09 SUP1338-10.
QA: v1305 FAILED/HOLD. Full audit Critical2/High8, bot Critical1/High5; DB 59 FAIL invalid due migrator role misconfiguration; 967 route requirements lack evidence, not observed defects. New finance P0 #1477. Root 99%, data 92%. Test exact-SHA, isolated restore and Production BLOCKED.
External independent reference gate: new verified accepted 0; cumulative accepted UNKNOWN / 10,000; BLOCKED / IN PROGRESS.
No runtime code, DB data, WLD, ledger, feature switch, Test or Production changed. No other worker worktree or branch touched.
GitHub Draft PR #1480: https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/1480 (OPEN, DRAFT, base predecessor #1476). Issue #1475 comment 6423875235, capacity #1170 comment 6423877361.
