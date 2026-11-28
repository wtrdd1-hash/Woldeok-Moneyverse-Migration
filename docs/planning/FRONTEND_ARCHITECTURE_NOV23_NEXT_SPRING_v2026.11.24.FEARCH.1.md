> **CURRENT OWNER OVERRIDE / 최신 사용자 지시 — v2026.11.28.2027.1.** [Frontend rebuild authority](FRONTEND_REBUILD_MASTER_v2026.11.28.2027.1.md). All earlier visual plans, images, palettes, tokens and visual acceptance directives below are historical only, not fallback. Functional, financial, security, accessibility and release contracts remain binding. Frontend rebuild is highest ordinary priority.

# Frontend Architecture Decision — v2026.11.24.FEARCH.1 (English canonical)

> Status: OWNER-APPROVED ARCHITECTURE DIRECTION / DOCUMENTATION ONLY / NO CUTOVER. Updated 2026-11-24 KST. [한국어](FRONTEND_ARCHITECTURE_NOV23_NEXT_SPRING_v2026.11.24.FEARCH.1.ko.md). Tracking: [#3422](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/issues/3422).

## 0. How to interpret this decision
**Chosen target**: browser -> HTTPS reverse proxy -> **Next.js 16 / React 19 + TypeScript / Tailwind CSS v4**, with reusable accessible UI components and controlled animation, communicating by **same-origin Next server/BFF** to **Spring Boot API** for all authoritative auth, user identity, game, finance, consents and data. Spring MVC + Thymeleaf remains a **legacy/in-flight temporary presentation**, not the target for *new* Nov23 UI after this decision. Do not abruptly replace active Test or Production and do not discard existing Spring code. No independent Node business authority or direct browser-to-DB/API credential bypass.

This owner-approved architecture choice supersedes *only frontend technology prescription* in dated Nov18/Nov20 Spring MVC+Thymeleaf plans, old task instructions and draft PRs. It does **not** supersede the integrated master for business rules, security, design asset ownership, finance, release gates, or any current owner instructions. Until integrated into protected main and acknowledged in each automation, existing merge/release gates remain unchanged. Historical docs are preserved. The owner approved this direction; source adoption is tracked in [document authority](../DOCUMENT_AUTHORITY.md), separately from runtime cutover evidence.

## 1. Evidence and design authority
- Observed repository main `9876c09888ec84034eec183cf1309c85df3d7447` on 2026-11-24; `frontend/package.json` already contains Next.js ^16.4.2, React ^19, Tailwind ^4; `frontend/src/lib/api.ts` uses `server-only` BFF. A Spring backend exists under `spring-backend/`. Versions listed are source-declared, not current deployment attestation.
- 2026-11-23 revised UI v10 **immutable commit `39888c7d26bdf688737a77b93a7da29e230b4168`**, `docs/UI_UX_SINGLE_REFERENCE.ko.md`, `docs/design/game-ui-v2026.11.23.10/README.ko.md` and 180 PNG. This reference is from closed/unmerged PR #3400, **not current main**. PNG file QA passed; visual approval per screen and production implementation did not.
- Retain Nov18 180 PNG and Nov23 v8, v10 PNG **all intact**, including real favicon `spring-backend/src/main/resources/static/assets/mv39/favicon.ico`. No generated replacement W/crown logo. Track design authority per route and record user-approved changes separately.
- Existing concurrent FE-A/B/C, QA1/QA2, Gemini work and Draft PRs #3411/#3416/#3420 must be inspected before file ownership or merge; do not silently replace their work.

## 2. Routing and identity data flow
Browser (same-origin HTTPS cookie) -> Nginx (single public origin) -> Next SSR/RSC/server route -> Spring Boot API (trusted internal network) -> PostgreSQL/Redis. Browser JS must receive **only minimal user DTO**, never internal credentials. Next is a presentation/BFF, Spring is authoritative. A proxy must preserve/set secure cookies correctly and reject untrusted forwarded headers. Do not forward all incoming cookies to unrelated services; allowlist session-specific cookies, sanitize logs and set no-store on per-user responses.

Authentication: use existing Google, Discord and first-party account flows **only after endpoint-by-endpoint contract verification**. OAuth callbacks and session issuance remain validated by the selected Spring identity owner. Secure, HttpOnly, SameSite cookies; CSRF on mutation; server-created user identity from validated Principal/session; never trust client userId/role/amount. Refresh/logout/revoke/expiry/cross-tab/session fixation, policy consent and admin RBAC need explicit E2E.

**P0 audit finding:** `frontend/src/lib/api.ts` currently contains a hardcoded fallback for the internal API token; remove fail-open/fallback during isolated implementation, require secret from server environment, rotate affected credentials after exposure assessment, add secret scanning. Never log/publish an actual token. Before deployment identify any Node/Nest gateway dependency/legacy authentication path and explicitly map each endpoint; no assumptions that Spring already implements everything.

User data contract: `GET /me`-equivalent authenticated server DTO (actual route verified before implementation), profile/name/avatar, roles, wallet/deposit, stocks, activities, game progress, message unread count and consent must be sourced from authenticated Spring contract. Forbidden/not-found/loading/empty/error states cannot be fake balances. Amounts use decimal and ledger receipts; transactions use idempotency, ownership and audit trail. User-scoped WebSocket/SSE authorization, reconnect resync and no cross-user channels.

## 3. Visual implementation and localization
Build a route-to-PNG acceptance inventory for all 180 routes, preserving the original image file for each. Shared tokens navy `#0C1020`, card `#151D32`, violet `#9C83FF`; define spacing, radii, typography and shadow in one token module, use component primitives, per-page complex layouts, responsive grids rather than repeated generic cards. No hardcoded mock market values. Charts, forms, bank and admin layouts must show actual server states. Real logo/favicon, no user-exposed system errors or unauthorized admin DOM.

English (EN) default, Korean (KO) second, then JA/ZH/VI; browser detection + manual persisted preference with predictable precedence. Accessibility: 320–1920px, 200% zoom, touch target, keyboard, reduced motion, readable errors, no layout shift. One authenticated support/chat affordance on every applicable page with server authority.

## 4. Migration without downtime
Phase A: freeze current Test/Production routing and record exact release SHA, signed rollback artifacts, UI route/status inventory and backend API schema; build isolated Next integration branch and contract adapter. Phase B: implement a **small read-only vertical slice** (public landing + one authenticated account view), including real SSR session and user DTO, only on separate Test canary. Phase C: migrate feature-by-feature on controlled reverse-proxy routing; no Nginx switch or shared Test deploy before QA2 ownership approval. Phase D: compare 180 reference pages, per-user session+financial data, role permutations and independent Test; promote to Production only after mandated exact SHA, CI, security, DB and zero-downtime/rollback gates. No forced big-bang migration.

**Current blockers**: Test frontend 55440 returns guest /bank and /stocks 302, while canary 55446 produced 403; preserve established anonymous login redirect behavior. 55444 serves only scoped 14-route legal/gallery fix; do not point whole origin there. Test /jobs,/quests,/shop,/blog 403 and full 180 E2E unknown. Test infrastructure ports are observed historical examples, not immutable constants: discover each run. No production changes authorized by this documentation PR.

## 5. Parallel work ownership and stop conditions
- FE-A: Next shell/design system, identity BFF + authenticated hydration, source token security findings, favicon/locale entry. Do not overwrite Spring auth without an interface contract.
- FE-B: wallet, bank, stocks, game, shops, community React screens and real API contracts, no ledger business logic in Next.
- FE-C: admin, support/chat, consent, locales and RBAC UX; backend still enforces access.
- QA1: API/session/OAuth/cookie/CSRF/RBAC/IDOR/token leaks, financial reconciliation and contract tests.
- QA2: Playwright screenshot diff vs v10, browser E2E across 5 locales, sizes and guest/user A/user B/admin, canary and Test rollout ownership only.
- Gemini/other collaborators: review ownership/branches/PR diffs before each edit. No agent may reinterpret draft design or switch servers without the explicit single decision.

**Stop** if auth/session ownership unclear, token leaked, owner-specific data mocked, any 302->403 or finance RBAC regression, merge conflicts, failed visual QA, unavailable rollback, or environment isolation unverified. Report BLOCKED rather than PASS. New branches and worktrees, TDD/review, start/checkpoint/finish logs, internal and GitHub changelogs EN+KO, re-read master/main and PRs at start, mid-work and pre-integration. No automatic Production promotion.

## 6. Change record
- START: inspected main, integrated master, AGENTS, Nov23 v10 immutable sources, frontend package/API BFF and active FE/QA ownership.
- CHECKPOINT: chose existing Next/React front + Spring API. Identified fallback internal token and Test financial route regression as P0 audit/QA gates. This is not a verified production vulnerability/exploit claim.
- FINISH: document-only isolated branch + Draft PR, update reservation prompts and cross-reference master/plan in branch. No code, server, auth or DB modifications; tests not executed and no deployment claimed.
