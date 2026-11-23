# Spring migration consolidation audit — v2026.11.23.1

**Status:** planning and source audit only; runtime migration and production promotion NOT completed.  
**Authority:** `docs/planning/INTEGRATED_PLANNING_MASTER.md` (and .ko.md), `docs/planning/PROJECT_PLAN.md`, `docs/superpowers/plans/2026-11-21-native-frontend-rebuild.md`, `docs/planning/NOV18_DESIGN_GLOBAL_I18N_CHAT_AUTHORITY_v2026.11.20.1.md`, `AGENTS.md`, `GEMINI.md`.  
**Baseline:** GitHub `main` at `9876c09888ec84034eec183cf1309c85df3d7447` (2026-11-23 KST review). This document does not override changed main; re-fetch before implementing or merging.

## Before work
Owner requests consolidation of all prior analysis and migration of remaining web changes to Spring. Reviewed the two repositories and the primary plans, Nov18 acceptance/audit and 2026-11-22 release receipt. Attempted the authorized remote environment first: `minipc`, `debian13` and `weoldog` are all offline in Desktop Commander. Therefore live systemd/Nginx configuration, database, actual running versions, local worktrees and deployment cannot be inspected or changed. Do not claim production migration or test success.

## Current verified repository distinction
- `Woldeok-Moneyverse-Migration` is the web/server repository. The tree still contains `spring-backend/`, `backend/` (NestJS), `frontend/` (legacy Next.js), `bot/`, `packages/`, and `ops/`. Presence in Git is **not** proof a legacy process runs; no blanket removal until dependency and runtime ownership audits pass.
- `woldeok-moneyverse-app` is an **Android Kotlin/Gradle app**, not the web UI. Keep its client platform intact; align API contracts with Spring rather than replacing Android code with Spring.
- Master plan's current frontdoor notes owner-approved maintenance HTTP 503 for public/member/admin documents; a protected native Spring admin catalog preview was connected on 2026-11-22, **not** general release. The cited source/operational hashes in the release receipt are historical checkpoints, not a fresh live verification.
- 2026-11-22 release records 662 Spring tests passing and separate 24 PostgreSQL-tagged tests excluded locally; these are historical results, **not** tests from this branch.
- Latest main commit explicitly concerns restoring Google/Discord OAuth. Preserve both authentication providers and verify their current real callback flow before editing.
- Nov18 audit identified mixed native/prototype/captured HTML, misleading sample values and synthetic charts, incomplete real bank/wallet/admin writes, unresolved chat/support ownership/auth and translations, and the lack of 180-route acceptance. Do not call a design mock functional.

## Target architecture and migration decisions
1. Web documents, member/admin UI, templates, web controllers and API endpoints consolidate under **Spring Boot MVC + Thymeleaf**. JavaScript may remain for client interaction; it must not run a duplicate Node server as the web authority.
2. PostgreSQL existing `SECURITY DEFINER` ledger and least-privilege boundaries remain the only authoritative balance-changing path; do not bulk-translate TypeScript financial logic into unrestricted Java SQL.
3. Use a single design system from the approved 2026-11-18 previews, including one navy/violet palette, current favicon, PC/mobile responsive routes and accessible controls. English primary default, Korean second, with the additional three supported locale choices and explicit selector/automatic detection following existing approved authority.
4. Preserve/restore Google and Discord OAuth, real role-based administrator access, live account/session provenance, wallet deposit/withdraw/transfer/receipts, banking/card APIs only when proved, and global support/chat access with real authenticated identity.
5. Remove stale Next/Nest presentation or forwarding services **only after** route-by-route ownership inventory proves they are DB-free and no session/API/bot dependency remains. A shared auth/API runtime must not be stopped as “frontend cleanup.”
6. On money-changing routes require decimal-safe amounts, CSRF, auth/session, authorization, step-up where applicable, idempotency, ledger proofs and receipts. Missing functionality fails explicitly; no fake success or demo balances.
7. Do not modify production until exact-source isolated test environment, authoritative DB/contract tests, browser desktop/mobile/locale coverage, security reviews, CI, deployment/rollback proof and verified operator gates pass.

## Ordered execution backlog (OPEN)
| Phase | Deliverable | Acceptance |
| --- | --- | --- |
| S1 | Fresh main SHA, full runtime inventory: git changes/worktrees, systemd/Nginx, DB owners, 180-route/API mapping, other agent ownership | Signed sanitized evidence; no collisions |
| S2 | Source-of-truth reconciliation and current Nov18 screen/route catalog; record missing native templates and actual endpoint contracts | Every route mapped to owner, template, API, auth, and test |
| S3 | Spring authentication and session parity for Google/Discord and admin authorization | Real protected Test browser callbacks, failures/refresh/logout |
| S4 | Shared MVC/Thymeleaf visual shell, all member and admin screens, responsive 320–1920, five locales, support entry | Pixel/interaction/accessibility review against approved previews; no fake data |
| S5 | Wallet, bank, deposit/withdraw/transfer/card, stock/shop/community/chat admin actions | Real Test DB API contract, ledger/role/CSRF/idempotency and receipt E2E; unsafe actions fail closed |
| S6 | Spring bot/worker and legacy runtime dependency inventory, retire only proven duplicate units | External integrations, scheduled workers, bot voice, auth and APIs regression checked |
| S7 | Full test and production release with zero-downtime switch and tested rollback | Exact SHA/artifact, PostgreSQL CI, 180-route desktop/mobile QA, test/prod checks |

## In-progress checkpoint
- Main SHA captured; no changes to existing application files, financial APIs, database, deployment, or security controls.
- Remote miniPC is offline; no live execution or rollback verification available.
- Work isolation: this dedicated documentation branch; parallel contributors should not edit this path concurrently.
- New documentation is English canonical and Korean companion; no credentials, logs with PII or live balances copied.

## Finish and handoff
**Finished:** verified high-level repository architecture and historical release/QA state; prepared ordered implementation and non-negotiable gates. **Not finished:** actual Spring code migration, current full-file source audit, live QA, staging deployment and production promotion. Next contributor must obtain online miniPC, re-fetch `main`, read the complete primary authority and changed source files, record new start/mid/end logs, isolate each code change in its own branch and obtain fresh tests before changing public service. This report records an evidence boundary, not a completion claim.
