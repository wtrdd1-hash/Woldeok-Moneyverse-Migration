# UI/UX — Single Reference: Design, Known Issues and Implementation Rules

> Version: `v2026.11.23.1` | Status: **PLANNING / OPEN QA** | Scope: website (public, member, admin; desktop/mobile) | Language: **English canonical** · [한국어](UI_UX_SINGLE_REFERENCE.ko.md)
>
> **Documentation consolidation only.** This page does not assert new fixes, test passes, Test deployment, or Production promotion. Existing worklogs, changelogs, release receipts, QA evidence, source, APIs and deployments are preserved unchanged. Baseline main SHA: `9876c09888ec84034eec183cf1309c85df3d7447`.

## 1. Single starting point and precedence

**Read this page first for UI design, rules, and unresolved issue navigation.** It consolidates references; it does **not** supersede product authority: [Project Plan](../planning/PROJECT_PLAN.md) → [Integrated Planning Master](../planning/INTEGRATED_PLANNING_MASTER.md) → their adopted [Nov 18 design/i18n/chat authority](../planning/NOV18_DESIGN_GLOBAL_I18N_CHAT_AUTHORITY_v2026.11.20.1.md), plus [documentation governance](../DOCUMENTATION_POLICY.md). If a newer approved plan changes a requirement, update this overview as a consequence, not the reverse.

Approved visual reference: [Nov 18 all-page design index](../design/all-pages-v2026.11.18.12/README.md) and its [previews](../design/all-pages-v2026.11.18.12/previews/home.png); [admin and global chat design](../planning/ADMIN_GLOBAL_CHAT_DESIGN_v2026.11.18.13.md); [image implementation handoff](../design/UI_IMAGE_IMPLEMENTATION_HANDOFF_v2026.11.19.31.md). A PNG/concept example is **not** evidence of implemented functionality or genuine backend data. Historical guidelines and the Nov 19 [frontend/UI guide](../FRONTEND_AND_UI_MASTER_GUIDELINES_20261119.md) must not override the newer Nov 18-approved design or later documented defects; in particular earlier “100% live” statements are snapshots, not current acceptance.

## 2. Non-negotiable design and behavior

| Domain | Requirement |
| --- | --- |
| Design system | Nov 18 deep navy `#0C1020`, surfaces `#151D32`, primary violet `#9C83FF`, secondary blue `#64B7FF`, high-contrast text. Consistent across every page and state. Reserve green/red for factual success/gain and danger/loss semantics, not competing page themes. |
| Brand | Use the **actual approved site logo/favicon**, including mobile admin/header and browser tab; no letter placeholder, unrelated icon, or mismatched logo. |
| Screens | Preserve original page-specific information architecture, actions, tables, forms, menus and receipt/error flows. One reusable responsive shell for public/member/admin; do not replace live functions with generic preview cards. |
| Responsive and accessibility | Check 320/360/390/430/768/1024/1440/1920 px, 200% zoom, long translated text, safe areas, keyboard and screen reader, visible focus; project 44×44 px touch target and no page-level horizontal overflow. |
| Localization | English default, Korean second language, Japanese, Simplified Chinese and Vietnamese; automatic supported-language detection plus persistent explicit manual choice. Manual choice takes priority. Translate loading/error/empty/admin/chat states, not just menu labels. |
| Global contact | One unobtrusive 56×56 floating entry, clear admin support vs member 1:1 messages, mobile nav/safe-area spacing at least 16px; no popups that overwhelm or interrupt ordinary updates. Focus, draft preservation, permissions and failure feedback required. |
| Data truth | All balances, positions, quotes, market activity, admin statistics and banking records must identify actual authorized source/API/DB data. Show loading/unavailable rather than fake positive metrics or stale seeded sample data. Monetary large integers must not be coerced to unsafe JavaScript Number. |
| Realtime | Update affected views **in place** without flicker, surprise modal or UI jumping. Prefer event-driven changes where appropriate, with reconnection, version/order, deduplication and fallback handling. Never present transport connection as proof of actual data freshness. |
| Auth/policy | Preserve Google, Discord and local sign-in, correct authenticated state, role-scoped admin affordances, real favicon and accessible terms/privacy links. Consent history/version and re-consent on material policy changes need explicit contract verification; a six-month cadence is a product requirement to verify, not an asserted legal mandate. |
| Architecture | Website target is Spring MVC + Thymeleaf integrated with existing backend contracts. Do not equate a cached Next markup, HTTP 200, a static preview, or working auth shell with fully migrated and functional pages. |

## 3. Consolidated open-issue register

These are **reported historical findings, not new live re-tests**. Keep the issue OPEN unless a later exact-source Test and Production receipt specifically closes it. Earlier scoped fixes do not automatically close wider defects.

| ID | Priority | Affected area / problem | Acceptance evidence required |
| --- | --- | --- | --- |
| UI-01 | P1 | Page-to-page navy/violet theme, header, layout, responsive styling and admin/client shell diverge; residual legacy/preview pages | Route-by-route visual diff against Nov 18 reference at desktop/mobile and 5 locales |
| UI-02 | P1 | Shop/stocks/quests/board/status prototypes previously lacked actual task actions, and some HTML/CSS, sample data, synthetic charts and precision defects were observed; later scoped display fixes exist | Current exact artifact: transaction/actions, source-linked UI, no sample residue across initial/error states; preserve prior fixes and recheck |
| UI-03 | P1 | Many member/public paths previously returned 403; `/admin/logs/errors` previously showed a load error; scanner regex was separately reproduced as a potential cause | Reproduce each route at edge and upstream with correct role; preserve protection of sensitive paths; no global security bypass |
| UI-04 | P1 | API-health view previously mixed “unmeasured” warnings with static green operational metrics and numeric success/latency values | Source-tagged measured values or explicit unmeasured UI; server-side provenance and route-specific receipts |
| UI-05 | P1 | Support/chat was previously represented by links or incomplete panels; real send semantics and trusted session identity/ownership/CSRF remained blocked | Authorized send and receipt, admin/member RBAC, retry/401/403/429/5xx, no spoofed user headers or fixed identity |
| UI-06 | P2 | Mobile admin favicon/logo missing in some layouts; global contact dock had measured 13–14px clearance against a 16px target | Present logo on all headers and verify safe-area spacing/keyboard across mobile widths |
| UI-07 | P2 | Vietnamese and other translations incomplete in legacy screens; manual selection and initial click may fail | EN/KO/JA/ZH/VI route × state matrix, persisted manual preference, no incorrect document language |
| UI-08 | P1 | Banking wallet deposit/withdraw, transfer, card issuance, financial actions and genuine balance binding require design/function coverage checks | Per-feature routes, state/error/permission and server receipt plus ledger consistency for permitted sandbox tests |
| UI-09 | P1 | Google/Discord/local login and policy links/consent may regress across shells | Provider end-to-end login, session transition, registration/re-consent and policy revision verification |
| UI-10 | P2 | Dense realtime banners/notifications and disruptive mid-screen status changes | In-place update, no spontaneous modal, reduced-motion and screen-reader announcement audit |
| UI-11 | P2 | Admin functionality, empty states, 44px touch targets, landmarks and navigation vary by route | Admin role×route functional QA, input/action preservation, accessibility and responsive report |

## 4. QA and closure protocol

For every defect record **route, viewport, locale, role, expected vs actual, screenshot reference, frontend SHA, backend/API source, reproduction, owner, severity, date, Test result and Production result**. Classify `OPEN`, `BLOCKED`, `TEST_VERIFIED`, `PRODUCTION_VERIFIED` independently; do not turn “visually correct” into “API working”. For actions, verify authorized request/response and resulting persisted state; for finance, use safe test fixtures and independent ledger checks. Negative cases: 401/403/404/429/5xx, session expiry, offline/reconnect, failed data, long values and concurrency.

Document-only edits are **not** deployment changes. Code fixes need a dedicated branch/PR, review, exact-SHA build and tests, isolated Test proof, and controlled no-downtime Production promotion with rollback evidence per project release governance. Other agents' ownership/worktrees and concurrent main updates must be checked. No bypass for security, financial, authentication or database gates.

## 5. Source documents and historical evidence (do not delete or rewrite)

- [Nov 18 approved cross-page design/locale/chat rules](../planning/NOV18_DESIGN_GLOBAL_I18N_CHAT_AUTHORITY_v2026.11.20.1.md) · [Nov 18 original previews](../design/all-pages-v2026.11.18.12/README.md).
- [2026-11-21 comprehensive frontend UI/function audit](../qa/2026-11-21-full-frontend-design-functionality-audit.ko.md) · [route coverage ledger](../qa/2026-11-21-nov18-frontend-route-ledger.ko.md) · [open defects](../qa/2026-11-21-nov18-unification-open-defects.ko.md).
- [Visual unification implementation log](../worklog/2026-11-21-nov18-visual-unification.ko.md) · [maintenance release evidence](../releases/2026-11-21-frontend-rebuild-maintenance.ko.md) · [frontend consolidation evidence](../releases/2026-11-21-frontend-consolidation-production.ko.md) · [prototype scoped fix evidence](../releases/2026-11-21-prototype-integrity-production.ko.md).
- [Design system legacy guidelines](../DESIGN_SYSTEM_GUIDELINES.ko.md) · [responsive reference](../RESPONSIVE_DESIGN_GUIDELINES.ko.md) · [previous frontend master guide](../FRONTEND_AND_UI_MASTER_GUIDELINES_20261119.md).

## 6. Change scope and handoff

**v2026.11.23.1 — Documentation-only consolidation.** Create one logical bilingual UI/UX reference (EN and KO counterparts); retain existing design documents, QA findings, update notices, worklogs, release records and code untouched. No duplicate issue-writing to historical records. On a subsequent UI change, update this issue summary with links to its independently recorded PR/Test/release evidence. Before merge, re-fetch latest main and reconcile any newly adopted design decisions.

Start: main `9876c09888ec84034eec183cf1309c85df3d7447`; remote mini-PC devices shown offline, so no host-level live QA performed. Mid/finish: see PR commit and merge review; this document's existence is not a runtime receipt.
