# v2026.10.21.1068 — User-acknowledged finance risk, requested Production promotion

## Before work (2026-10-21 19:14 KST)
- User explicitly requests proceeding with production promotion despite acknowledged ledger integrity risk. This is acceptance of a specific risk, not evidence the risk was resolved.
- Live main 0d12f99b, bond / blog safety PR #976 candidate 3a831448, GitHub CI #2858 success. Current public Production frontend backend generation v1055 but symlink production-current still v1053; public API version 200 with body unknown. Official Test active source 9f39f041.
- Read AGENTS, release guide, master plan, prior bilingual v1061/v1062/v1067, staging helper, systemd/Nginx current state. Separate concurrent worktrees retained.
- Known financial issues: direct money table app DML, unjournaled bond and other flows, unknown opening-balance provenance. Release guide explicitly disallows exceptions. Do NOT represent a passed finance gate without remediation.
- Strategy: capture backups/restore identity, establish exact source and CI, test successor with schedulers disabled, retain running old generation and rollback; do not manually rewrite member balances or transaction histories.

## Checkpoints
- Pre-change recorded. Further observed states to append.

## Deployment execution — verified 19:14–19:31 KST
- GitHub PR #976 merged as exact main SHA 6d4e258a8aa419bfe39cb4b59fc6a5edd5ea9e5b. Last branch CI #2858 SUCCESS. Built backend and Next using exact merged SHA; immutable Test/Production v1068 generations staged with Next BUILD_ID matching manifest.
- Took a full production DB backup with pg_dump custom archive, ~80MB, SHA256 d64c48947cf44708dd68ac8c9b5bc09b653431ab425074565f2b892a584bc9a2; checksum and pg_restore TOC read PASS. No migration or manual ledger/balance changes.
- Launched isolated Test canaries on 3210/3211, disabled schedulers/outbox/SEO; version and health PASS, anonymous home/bonds/blog/admin-blog/login GET HTTP 200. Public official Test remains old SHA 9f39f041; no authenticated Test finance E2E acceptance.
- Launched prod successor canaries on 3333/3334 with schedulers/outbox/SEO disabled. Verified correct version and health, five frontend routes 200. Replaced canaries with permanent enabled systemd v1068 backend/frontend units on ports 3333/3334 and re-verified.
- Backed up old Nginx site config and atomically updated only the four Production backend upstreams 3000→3333 and Production frontend upstream 3234→3334. `nginx -t` PASS, graceful reload. Public version immediately changed to exact SHA 6d4e258a; public home, bonds, blog, login, admin/blog, health, status all 200.
- Atomically advanced `production-current` pointer from prod-v2026.10.21.1053-84b86508286b to prod-v2026.10.21.1068-6d4e258a8aa4, retaining both previous production running services. Official `verify-host-runtime-identity` reported ok:true, failures:[]; manifest, frontend build, both permanent systemd EnvironmentFiles, working dirs and public version match.
- Read-only DB pre-/post: auth_sessions 1873, account_balances 40, ledger_transactions 851, postings 1732, treasury_bond_holdings 0; no observed table-count change during cutover. Security negative tests: unauthenticated bond POST 401 and unauthenticated blog publish 403. All site SEO basics (robots, sitemap, ads.txt) 200.

## Outstanding risk / operational debt
- Financial readiness still exits 2 BLOCKED due moneyverse_app direct DML on accounts, account_balances and system_treasury_vaults. User explicitly instructed promotion despite this integrity risk; it was not fixed or reclassified PASS. Bond/Repo/FX/pension/SWF ledger and idempotency remain incomplete; no successful purchase/repay was tested with real member credentials.
- v1068 backend has background scheduler, SEO indexing, Discord outbox, auto-news and SWF tasks deliberately disabled to avoid two active writers during blue-green. Previous Production backend retained as background schedule leader for continuity. This split generation remains an operational debt, not a normalized long-term architecture.
- Official public Test is not switched. Test canary verified read-only paths but no 5-pass signed-in UI or session continuity testing. Legacy Production process and Nginx rollback backup retained until follow-up acceptance.
