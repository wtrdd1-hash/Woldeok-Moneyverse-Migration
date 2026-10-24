# Moneyverse planning v1216 — F675-111 verified member shop wishlist

**Date:** 2026-10-24 12:14 KST. **Previous:** Feature Improvement v1214. **Current:** Feature Addition v1216. **Next:** Feature Improvement v1218 provisional. **Status:** PARTIAL / DRAFT / RELEASE HOLD.

## Evidence and source audit
- miniPC Debian 13.6 reachable; Backend/Frontend/Nginx/Docker/MCP active and PostgreSQL connected. Installed using-superpowers, brainstorming, worktrees, writing-plans, verification skills read on miniPC because skills__list returned empty.
- Main 49788d09494fed3e463651945b83386e87dd47bc checked start and midpoint; authoritative AGENTS.md, README.md, PROJECT_PLAN English and Korean read. Main plans hashes c1b6cfd5... / 73f90946... at start/mid. Latest QA v1221 FAILED/HOLD on older SHA 46794ff0; current main exact-SHA authenticated Test not proven.
- Actual `frontend/src/app/shop/page.tsx`, `shop-store-view.tsx`, `backend/src/shop/shop.controller.ts`, `shop.repository.ts`, `packages/database/migrations/123-store-read-models-v2.sql`, `frontend/src/app/app-api/v1/[...path]/route.ts` examined. Member/public catalog and purchase exist; no shop wishlist. Stock watchlist exists separately.
- Open planning Drafts #1103 and #1111 remain unmerged; independent branch from main avoids overlap. A wallet receipt #1115, B P2P #1117, C public board search #1116, QA #1114 have separate ownership. No other worktree touched.

## Design and acceptance
- F675-111: intentional owner-only Save/Remove, private list with live catalog state, truthful unavailable and conflict states, no automatic buy/reservation/alerts, no WLD/inventory mutation.
- P0 ENV1216-01 SEC1216-02 REL1216-03 SHOP1216-04; P1 SHOP1216-05..10. Contracts: authenticated GET HMAC keyset, CSRF POST idempotent CAS digest receipt, fixed-search-path SECURITY DEFINER, least privilege, 100 active cap, hidden-item redaction, admin aggregates, private SEO, Android, WCAG 2.2 AA, 100-way concurrency, isolated synthetic 10,001-row cursor and safe feature-OFF rollback.
- QA v1221 blocks: Production/dev shared 5433 DB, wildcard port, app DML 235/241, 3 PUBLIC bank functions, migration266 drift, 2 HIGH production/2 CRITICAL+10 HIGH full pnpm audit, bot 1 CRITICAL+5 HIGH, frontend SEO failures, #1088 build-only auto-merge, #1113 dangling release pointer, missing exact-SHA deployed Test/auth finance E2E and isolated backup restore.
- External references: https://www.postgresql.org/docs/18/sql-insert.html ; https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html ; https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/ . 3 independent publisher families reviewed, **0** new independently approved records, cumulative deduplicated accepted **UNKNOWN** of **10,000** => BLOCKED / IN PROGRESS.

## Guardrails
- This run modifies only the six existing official EN/KO planning/update documents and this worklog. It does not modify runtime code, SQL, financial data, Test/Production, service processes, feature switches or other worker branches.
- Proposed implementation must use its own engineering branch, exact-SHA official Test/CI/ACL/security/restore and separately approved GitOps Production promotion. No release claim from document verification.

- GitHub implementation issue: #1119 OPEN; separate engineering ownership, not implemented.

## Stage checkpoints and final review
- [x] BEFORE: read canonical main and latest QA, selected isolated planning scope and recorded source hashes.
- [x] IN PROGRESS: inspected shop/DB/app-api source, drafted paired EN/KO integrated specifications, rechecked main.
- [x] FINISHED: corrected idempotency lock ordering against AGENTS.md §4; 10 backlog IDs in all six official docs, git diff check, GitHub Draft PR #1120 and issue #1119, no runtime/deployment.
- Release remains HOLD; exact-head CI and official Test financial E2E not run.
