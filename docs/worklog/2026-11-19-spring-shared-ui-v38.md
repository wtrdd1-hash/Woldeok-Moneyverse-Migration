# Spring native violet UI / safe help — Worklog v2026.11.19.38.1

Date: 2026-11-19 KST; owner approved full Spring frontend migration and authorized mini-PC changes/conditional Production promotion.

## START (before code)
- GitHub public main: c131ef1039fddbba064e04a9c07bbba06e0a38a2; mini-PC local integration main: ec22442819b986e190d5ba6d9fd2539d86efb2db (GitHub main and mini-PC main diverge; **do not conflate**). Isolated worktree: feat/spring-violet-ui-shell-v20261119-38.
- Read authoritative EN/KO project and integrated masters, newer owner Spring-only directive v28, G0-G6 release rules, design references 180 + 2, v31/v32 image handoff, AGENTS/Superpowers, admin code and Spring native layout.
- Parallel Gemini owner uses /srv/moneyverse-data/tasks/mobile-ui-owner-approved-v2026.11.19.37/repo and is editing spring-backend/src/main/resources/static/index.html. **No edit to index.html, root route, Nginx, operations, finance, login or DB.**
- Targeted independent Spring-native scope: shared navy/violet reusable support dock on Java Thymeleaf template pages, matching approved 56px round design; enhanced admin server-rendered page shell for real authorized users (existing LiveAdminUsersPage and consuming admin views) with site-wide support jump links; preserve all server authorization and source-truth statuses, no unverified chat send.
- Existing mv28/layout footer uses a static pill link, admin shared renderPage uses inline CSS. These are working server paths, unlike stale Next static snapshots. Introduce tested UI components and improve their design, no Node runtime.
- Existing root public page observed at 14:17 KST now serves "홈 대시보드" HTML and not the old three-concept-gallery title, consistent with ongoing v37 work; not attributable to this branch. Do not override or double-deploy.
- Prior 180-route migration board still reports 5 verifiably Spring-native pages, 175 not certified; no 180/180 completion claims.
- Mandatory: RED→GREEN tests, Spring unit + Thymeleaf integration, bootJar, isolated Test server/Chrome where available, exact SHA, audit trail; scoped Production only if verified and conflict-free, otherwise hold.

## MID
- Kept concurrent Gemini v37 root HTML untouched, isolated branch on local ec22442; rechecked public GitHub main c131ef1.
- Implemented actual Java admin visual shell: 240px sidebar, navy/violet design CSS, mobile <=980px scroll nav and 56px no-JS safe help dock; retained existing auth/roles/source/failure codes.
- Integrated semantic details/summary support into existing Spring Thymeleaf calculator/hub/status footer templates. No message API or fake data.
- TDD RED→GREEN: six initial behavior cases, one status CSS omission, two CSP self-style failures; only same-origin CSS enabled, no script expansion.
- Final full Java clean test bootJar **251 PASS/0 FAIL/0 SKIP**; embedded Spring H2 random-port four HTTP PASS; JAR SHA ba94b7...dafd09ef with v38 css/templates present.
- Generated exact 180 PNG-to-route mapping, 10 source shell candidates but zero new Production certifications. No headless Chrome/real authenticated admin finance/official Test QA.


## END
- Scope: Java admin server shell/CSP, v28/v29/v30 templates and two scoped v38 stylesheets, JUnit, EN/KO planning/QA, 180 route image map, public/internal release notes.
- Due to divergence between local integration main and public GitHub main, do not ship eight concurrent unpublished commits in a UI PR. Prepare clean stacked PR from published Spring-routing baseline, re-run tests there.
- Spring source and H2 HTTP verified; no real Chrome pixel comparison, authenticated admin/finance, official Test Nginx, immutable artifact rollback or Production validation; **release HOLD**.
- No modifications to live processes, DB/ledger, Nginx, Discord, Gemini v37 homepage or /admin static preview. 180/180 and production completion are explicitly not claimed.
