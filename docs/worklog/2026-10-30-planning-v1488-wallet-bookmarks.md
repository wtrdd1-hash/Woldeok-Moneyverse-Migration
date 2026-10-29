# Moneyverse planning v1488 — Owner-private wallet transaction bookmarks

**2026-10-30 04:05 KST | Feature Addition | DRAFT / RELEASE HOLD**

**Cycle:** Previous Feature Improvement v1486 → Current Feature Addition v1488 → Next Feature Improvement v1490 (provisional). **Main:** `62c6cd038951d65c94b709302bdaec6e75b080b6`, checked at start and mid. **Handoff:** [#1936](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/1936). Draft PR link recorded in GitHub update log after opening.

## Start evidence
- MiniPC Debian 13.6 system status: backend/frontend/Discord/MCP/Nginx/Docker active, DEV DB connected. Root 87%, data volume 94%; do not delete others' worktrees or backup data.
- `skills__list` returned no installed skill URI, so `skills__read` could not be invoked; local repository skills `using-superpowers`, `brainstorming`, `writing-plans`, `using-git-worktrees`, `verification-before-completion` were read and used. Planning output only; no product code implementation without human review.
- Latest main authoritative `AGENTS.md`, `README.md`, EN `PROJECT_PLAN.md` and KO parity consulted. GitHub recent main commits, open PRs, QA and issues checked. Worktree isolated from main and A/B/C/Gemini/QA branches.

## Investigation and design
- `frontend/src/app/wallet/activity/page.tsx` renders 50 owner-history rows, periods and cursor; no save/unsave action. `backend/src/wallet/wallet.controller.ts` offers GET activity but no bookmarks. `packages/database/init/001-economy-core.sql` defines ledger transaction/posting/account schema. DEV PG read-only query: bookmark table absent, ledger_transactions=891 (DEV only).
- New F675-178 owner-private bookmark is not F675-176 saved filters or F675-177 monthly summary. Save/remove up to 100, owner-visible WLD postings including inbound and frozen/closed history, 20/50 keyset view, HMAC cursor, 50-ID status, atomic same-key retries, strict app-role ACL, no free-text, no ledger changes. Full UX/API/DB/transaction/security/admin/mobile/a11y/SEO/KPI/test/rollback spec in paired integrated masters.
- Latest independent QA v1379: finance focused 6 FAIL/3 PASS, whole lint 3 errors, migration 304 unique source files / 293 applied / 5 checksum mismatches, 462 historic missing refs. SWF and Treasury provenance still blocked. No actual Production financial wrongdoing inferred from these findings.

## Mid and completion controls
- Main and EN/KO project plan hashes rechecked before edits; main unchanged at `62c6cd038951d65c94b709302bdaec6e75b080b6`. Additional final remote/main recheck and GitHub PR/CI verification recorded separately.
- P0 REPO1488-01 SEC1488-02 FIN1488-03 REL1488-04; P1 BOOKMARK1488-05..10 (10 total). Proposed isolated PG 10,001 transactions, 100 forged owners, 100 races, 50 lost responses, 30 session switches **NOT RUN**.
- External independently acquired, deduplicated, evidence-classified references newly approved **0**, cumulative **UNKNOWN / 10,000**; **BLOCKED / IN PROGRESS**. Feature flag OFF; documentation only, release HOLD, no Test/Production deployment, no branch merge, no WLD/ledger changes.
