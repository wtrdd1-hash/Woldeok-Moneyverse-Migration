# A1657 — Member bank standing snapshot download

## Before work (2026-10-28 16:57 KST)
- Source: `origin/main` `d12c948ac454b0762cfb7fb0cddf83703a775172` at checkout. Read AGENTS, README, canonical English/Korean planning and QA v1344.
- Existing member bank standing reads `public.bank_get_my_standing(actor)` through `BankRepository`; no member CSV statement export. Scope: owner-only, read-only cash/deposit/interest/active-loan snapshot with exact integer strings, browser CSV and Android JSON parity. No new migration, balance changes, privilege changes, or finance reconciliation claim.
- P0 blockers: data disk 97%, live 18,000 WLD balance/ledger drift, broad application DB privileges, official Test exact-SHA not certified; Production HOLD.
- [x] Check remote main, prior QA and open PRs. [x] Create isolated worktree. [x] RED tests (3 backend fail; frontend module missing). [x] Backend/API/DB read. [x] Browser CSV CTA. [x] Android gateway contract. [x] Full gates and QA (candidate code SHA). [x] Draft PR and release HOLD decision.

## In progress (2026-10-28 17:02 KST)
- Added owner-only GET banking/standing/snapshot using existing SECURITY DEFINER bank_get_my_standing(actor), strict integer-string validation and a bounded read-only response. No new migration.
- Added same-origin member-gated CSV route and UI CTA, Android gateway no-store/noindex, negative/large-amount and auth tests. GREEN: backend focused 3/3, frontend focused 32/32 (2 CSV + 27 Android + 3 route).
- No mutation to existing workers, Production or PostgreSQL. Full gates and isolated PostgreSQL pending.

## Finished — code SHA `894d202a52a942a7a2b918fe8a8b7e31edbd5e7e` (2026-10-28 17:13 KST)
- Root `pnpm typecheck` PASS; `pnpm lint` PASS (0 errors, 1,099 warnings); `pnpm test` PASS: Backend 1,939 PASS / 440 SKIP, Frontend 1,878 PASS, Database 45 PASS / 3 SKIP; API contract PASS. Root audit 0 High/Critical (9 Moderate, 3 Low); Bot audit 0 vulnerabilities.
- First Next webpack build FAIL on Google font loader URL parsing, without touching task files. Retry using a local cache of genuine downloaded font files completed compile, TypeScript, 609 static pages and output trace; GitHub exact code-SHA Runtime Check and build PASS. First Bot test FAIL for absent local dependencies; offline `npm ci` and re-run 11/11 PASS. Retain both failures as evidence.
- Isolated synthetic PostgreSQL 17.11 PASS: >2^53 exact WLD, owner parameter, absent actor, app-role direct SELECT/INSERT denied; container removed. Not equivalent to live schema, session-to-DB actor binding or full ACL verification.
- Draft PR #1719. Open PRs 44 before this PR, 45 after; final inventory 46 non-main remote branches, 45 Draft PRs, 3 conflicts, 17 failing-check PRs, 0 duplicate PR heads. All 352 incident recovery refs valid; 0 branches deleted.
- Official Test `/api/version` `cfb13272beea53c4d8c20eff7f379b6f66343033`, not candidate; Production version `unknown`. QA v1344: 18,000 WLD cash/ledger drift, broad app DML, backup restore not verified, data disk 97%. Full authenticated Test E2E and GitOps financial release gate BLOCKED. No main merge, Test/Production deployment, live DB/ledger writes, feature activation or rollback.
- Main remained `d12c948ac454b0762cfb7fb0cddf83703a775172` at start/mid/pre-final; canonical EN/KO planning SHA256 unchanged. Final documentation SHA requires repeat exact-SHA verification before any merge; PR will carry latest evidence. **Production RELEASE HOLD.**
