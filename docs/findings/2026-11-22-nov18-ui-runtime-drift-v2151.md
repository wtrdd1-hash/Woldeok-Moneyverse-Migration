# Nov 18 UI consistency — source, runtime, task-history audit

Version: v2026.11.22.2151.1 | Status: **INVESTIGATED / FULL RELEASE HOLD** | Recorded: 2026-11-22 KST

[한국어](2026-11-22-nov18-ui-runtime-drift-v2151.ko.md) | [Worklog](../worklog/2026-11-22-nov18-ui-runtime-audit-v2151.md)

## Authority, scope and baseline

Read `docs/planning/PROJECT_PLAN.md`, `INTEGRATED_PLANNING_MASTER.md`, `docs/DOCUMENTATION_POLICY.md`, `docs/CURRENT_DOCUMENTATION_STATUS.md`, approved `NOV18_DESIGN_GLOBAL_I18N_CHAT_AUTHORITY_v2026.11.20.1.md`, the 180 concept-PNG index, prior Nov 21 UI QA/route ledger, recent PRs and FE/QA task logs. English source and Korean second language; product authority remains in the integrated plans, not this finding. Migration `origin/main` checked at start and during investigation: `86393ad8bc1c66ba5c8593aa3770e2310173fd29`. Android repository was identified separately and not modified. The 180 designs are *planning concepts*, not functional acceptance certificates.

Investigation is scoped to Nov 18–22 UI delivery, recent FE-A/FE-B/FE-C and QA-1/QA-2 logs, current Spring static/templates, Nginx/Java runtime and anonymous local HTTP requests. It is **not** an exhaustive line-by-line review of thousands of historical documents, nor an authenticated multi-browser acceptance run. No credentials, private sessions, financial transactions, restarts or deployment modifications were used.

## Findings backed by read-only checks

1. **Source/design fragmentation (P0 for visual acceptance).** Current `main` has 59 top-level `spring-backend/src/main/resources/static/*.html` pages and 22 Spring template HTML files. Of the 59 static files, only **19 reference `/css/mv-shell-nov18.css`**; **50 include `/_next/static` references**; **48 retain the legacy `bg-[#090A0F]` body class**. All 59 refer to `mv-theme-nov18.css`, but the shell/DOM and older Next styles differ. Source flags alone are not rendered-visual verdicts. Examples: `account.html`, `support.html` use the new shell CSS alongside old Next assets/body classes; `bank.html`, `shop.html`, `index.html` do not reference that new shared shell CSS.
2. **Multiple live page providers (P0 for runtime identity).** Nginx configuration contains legacy static aliases, a v2026.11.18.24 frontend routing include, and upstreams on `4550`, `4632`, `4646`. Local Java listeners exist on all three; `4632`/`4646` processes started Nov 18; `4550` started Nov 22 **20:32 KST**. The `4550` Spring JAR was last built around **20:30 KST**. The 20:43 and 21:21 UI merge commits therefore post-date its build/start, although some HTTP responses match newer on-disk HTML: dynamic/static filesystem serving is plausible; exact per-route origin and runtime artifact identity remain **unproven**.
3. **Anonymous edge routing is not a common acceptance path.** On loopback with Host `easy-scraping.com`, `/`, `/bank`, `/shop`, `/stocks`, `/quests`, `/board`, `/work`, `/account` returned 200; `/wallet`, `/chat`, `/support`, `/admin` returned redirects; `/api/version` returned **503**. No credentialed redirect was followed. `/` supplied a document titled “My assets dashboard · W Moneyverse,” whereas checked-in `main` `index.html` is titled “홈 대시보드 · 월덕 머니버스”. HTTP 200 alone does not verify a functioning, unified page.
4. **Inconsistent artifact/source fingerprints.** `account.html` had a different SHA256 in the 20:30 embedded JAR versus current `main` static source; the `4550/account` HTTP body matched current source. Therefore do **not** infer deployment solely from a JAR filename/process uptime or solely from a working URL. Require exact source SHA, packaged resource manifest and response fingerprint for every route.
5. **Existing negative QA was not closed by the PR titles.** Nov 21 audit categorized 180 targets as 26 new-shell, 5 partial prototype, 37 other, 79 error/blocked, 33 dynamic-not-run. The findings also describe mismatched administrator themes, missing operations in shop/stocks/quests/board/status, role/gate conflicts and locale/chat defects. These are **historical Nov 21 results**, not a rerun after Nov 22's last UI changes.
6. **Current work ownership and gates are incomplete.** Latest mini-PC task logs from FE-A, FE-B, FE-C, QA-1 and QA-2 explicitly record read-only checks, no full authenticated E2E, and exact-SHA Test/Production acceptance as blocked. FE-C reports an existing worktree with 33 uncommitted paths and FE-A ownership of shared chrome: do not overwrite these. Current GitHub changes are committed under a shared human GitHub identity, which is insufficient to attribute a specific edit to Gemini, Codex or another agent. No unsupported blame assignment.

## Chronology (commit time, KST)

| Date/time | Evidence and outcome |
| --- | --- |
| Nov 18 | 180 PC/mobile designs as planning-only images; partial Spring/Next static handoff, 13-route Nginx include |
| Nov 19 | Image handoff restored, but Spring implementation and general Production release explicitly pending |
| Nov 20 | v42.3.1 member-home UI regression rollback and *home-scoped* production repair; no whole-site promotion |
| Nov 21 | Partial 26-shell integration, 147 static-path and 33 dynamic-path audit; broad defects still OPEN |
| Nov 22 18:48 | Merge `9a4f63d0c6`, PR #3355: user shell edits |
| Nov 22 19:45 | Merge `768d932b20`, PR #3356: separate Thymeleaf home AI/terminal UI |
| Nov 22 20:32 | Runtime `4550` process started, built JAR timestamp approx. 20:30 |
| Nov 22 20:43 | Merge `0da7aea1ec`, PR #3359: bank/arcade/casino/pension/work etc and shell stylesheet |
| Nov 22 21:21 | Merge `86393ad8bc`, PR #3362: account/chat/support/profile and other remaining static pages |

See [PR #3355](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3355), [#3359](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3359), [#3362](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3362), and open Test-first delivery [#3357](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3357).

## Required remediation and release gates — NOT executed by this documentation change

- **P0** Capture an authoritative URL → Nginx match → process/unit → template/static resource → build SHA → GitHub SHA matrix. Eliminate divergent renderers only when real authenticated capabilities and rollback are preserved.
- **P0** Build a single Spring MVC/Thymeleaf layout and design tokens, not repeated HTML overlays. Preserve the Nov 18 navy/purple approved visual: `#0C1020`, `#151D32`, `#9C83FF`; required 240px desktop navigation and 5-tab mobile navigation must render consistently. Retire old Next CSS/snapshots only after migrating actual functionality and verifying dependencies.
- **P0** Protect authenticated support/chat, member profiles and admin state; verify Google/Discord OAuth callbacks and session boundaries separately. No test writes on actual money/ledger. Unknown/error states cannot become synthetic success.
- **P1** Inventory all 180 design targets by route family (including all 40 admin targets), identify dynamic and protected routes, map actual API behaviors, and compare real desktop/mobile screenshots at approved breakpoints and five locales (EN primary, KO, JA, ZH, VI).
- **P0 gate** Isolated **exact-main-SHA** Spring Test instance, browser real-data API E2E, auth/RBAC/CSRF, no cross-user leakage, finance/ledger read integrity, responsive/accessibility, and build/rollback proof. If Test health/version is 503 or exact SHA unproven: HOLD. Promote with verified zero-downtime gate, otherwise do not claim Production success.
- Coordinate owners: FE-A shared shell, FE-B user layout, FE-C admin/support/locale, QA-1/QA-2 independently; verify per-file ownership against live task logs before implementation. This audit branch owns *docs/findings/worklog/updates only*.

## Audit result

**Root cause is compounded source style fragmentation + multiple live render/route origins + source/runtime divergence + missing full acceptance evidence.** Do not collapse `main` merged, CSS partially loaded, HTTP200, Test verified, and Production released into one status. This report is **DOCS ONLY**; no new Test, Production, frontend, backend, DB or Android changes.
