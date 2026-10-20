# v2026.10.20.1022 — Production promotion execution worklog (English canonical)

[한국어](2026-10-20-production-promotion-v1022.ko.md)

## START — 2026-10-20 22:28 KST
User reconfirmed Production promotion. Fresh main 4405515674179d0d5d9762ff991e0ddcc2184c45. Read AGENTS, Superpowers skills, Integrated Planning Master, Project Plan, v1011 evidence and deployment runbook. Isolated branch release/blog-production-gates-v2026.10.20.1022 and MiniPC worktree; no changes to Gemini/QA branches. Operator start log recorded in /srv/moneyverse-tasks.

## MID — safe backup, full-data restores and reproducible tests
Read-only Production finance FAIL with 19/40 balances +4,779,188 WLD difference, 5 no-posting accounts +2,627,807 WLD, and app direct DML on 3 protected tables. Captured sha256-verified 600-mode Test and Production full pg_dump backups under /srv/moneyverse-data/backups/blog-promotion-v1022. Restored each full data set to disposable network-none PG17. Test original 96 auth_sessions, 60 balances; real restored migrations 278 then 279 PASS. Applied both migrations to ACTUAL official Test database and confirmed counts, checksum rows, app denies. Production full-data restored 40 balances and 1692 postings; 269–279 sequential schema application PASS in isolated superuser clone (ACL parity not certified).

Historical source backups: Sept 15 restore 28/28 balances matched ledger, Oct 11 restore already 19 accounts +4,774,778 WLD mismatch, current +4,779,188 WLD. Found original Production migration 266 hash matches Git commit 310cb701 while latest source was modified in c1271d2; no checksum changes. Live bank_transfer_pocket references nonexistent accounts.balance. No financial records or production grants changed.

## LIVE TEST — exact SHA / no-gap cutover
Built exact-SHA contract/Nest/Next, staged immutable Test and Production candidates. Original Test full DB restored safety checks. Started new Test backend/frontend on 3210/3211 alongside previous versions. Switched only Test Nginx upstream to new healthy services, verified public backend/frontend SHA and noindex. Atomically switched test-current pointer to complete same-SHA release and installed final-release systemd env overrides. With Test canaries serving public, restarted Test primary backend/frontend 3100/3101 one by one. Verified versions/route health; restored primary Test Nginx upstream using nginx -t/reload. Stopped Test canaries. Host Test runtime-identity release verifier returned ok:true/failures:[] with exact source SHA.

## TDD + Test smoke
Existing HTTP-only QA expected 401 for publicly listed published announcements/photos, yet source deliberately returns 200. RED node:test first without policy module, GREEN 3 unit tests after factoring guard expectations into scripts/qa/http-guard-policy.mjs, and integrating it into full-suite-5pass-qa.mjs. Corrected 166 route + finance + locale + admin/guard HTTP-only results: 257/257 passed. **Tool overall returns exit 2** with BLOCKED_E2E_EVIDENCE_REQUIRED due absence of actual signed-in actions, browser viewport, country content fidelity, admin step-up, ledger transaction, session continuity; do not mark full user E2E as pass.

## Production recovery hardening
Previously final systemd zz-v697 rollback drop-ins pointed to deleted prod-v600 paths; saved original files and updated WorkingDirectory to existing immutable v897 matching currently running backend version, systemctl daemon-reload only, no Production restart. Staged immutable Production candidate at same source SHA but DID NOT switch production-current, any Production service, Nginx Production vhost or Production schema. Public Production API/frontend remain legacy and mismatched. Legacy blog JSON 0444/AI 503 remain.

## END — formal status
**Official Test PROMOTED and exact-SHA verifier PASS. Production staging only / Production PROMOTION BLOCKED** by uncertified WLD mismatches, direct app DML, altered-applied migration 266 checksum, bank transfer SQL schema error, missing ACL-preserving Prod migration rehearsal and 166-page 5-round authenticated functional QA. Updated bilingual release report, internal/GitHub update and docs index in this branch; no fake ledger corrections or deployment claims. Operator mid/end receipts maintained on MiniPC. Commit/PR CI result recorded separately when complete.
