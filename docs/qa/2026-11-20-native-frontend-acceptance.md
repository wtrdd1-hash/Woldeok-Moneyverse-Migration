# Native frontend implementation and acceptance ledger — 2026-11-20

This page describes the November18 Spring MVC/Thymeleaf frontend migration. It is an implementation/QA ledger, not a statement that every existing page or production feature works.

- Task PR: https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3311
- Design authority: ../planning/NOV18_DESIGN_GLOBAL_I18N_CHAT_AUTHORITY_v2026.11.20.1.ko.md
- Detailed work/checkpoint history: ../worklog/2026-11-20-nov18-design-integrate.md
- Source checkpoint44a773e942:394 isolated Spring tests,0 failures/errors/skips; bootJar successful;220 Node tests passed. CI checkpoint7cb9890d95 additionally passed9 actual-service PostgreSQL cases, with0 failures/errors/skips (run44689405118).
- All task source work is on isolated MiniPC branches. The original checkout's unrelated uncommitted changes were not reset, stashed or overwritten.

## Current release gates

| Gate | Current evidence | Status |
|---|---|---|
| Approved source design | Authority, approved preview, native templates and exact palette used | Implemented for listed surfaces only |
| Isolated Spring/API/UI tests |394 cases at44a773, zero failures/errors/skips; JAR built | PASS at that source only |
| Node contracts |220 at44a773, no failure/cancellation/skip | PASS at that source only |
| Real Java service/PostgreSQL behavior |9 actual-service CI cases at7cb9890d95,0 failures/errors/skips; rollback-only fixtures | PASS in disposable CI only |
| Browser clicks, keyboard, computed layout |IAB recovered; production baseline screenshot/menu observed; native candidate preview pending | IN PROGRESS |
| Responsive/zoom matrix |Authored CSS/HTTP/unit checks only;320–1920px and200% browser evidence absent | OPEN |
| Human translation review |Five-locale catalog parity and rendered-copy checks; no native-speaker certification | OPEN |
| Exact-source public Test |test.easy-scraping.com/api/version returns403 at15:25KST | BLOCKED |
| Production availability |Root returnedHTTP200 at15:25KST; this does not identify the deployed source | Availability only |
| Main promotion/rollback/session continuity |Current task has not passed Test/browser acceptance | HOLD |

## Feature-family coverage

| Surface | Implemented source behavior | Verified here | Still open |
|---|---|---|---|
| Home / and /index.html |Native SSR, shared sidebar/header/mobile nav, five locales, actual source-backed widgets and honest failures |HTTP/localization/cache/source contracts |Real browser rendering, production identity and every linked destination |
| Administrator dashboard |Native rendering, actual source metrics,35 original tool links,6 categories/search and correct category counts8/4/4/6/6/7 |HTTP/catalog/filter contracts; no fake member rows/optimistic switch state |35 destination operations, real role/reauth/TOTP/elevation/action acceptance |
| Wallet aliases |Verified private page, exact string balances/history, matching recipient/amount transfer receipt, CSRF, stable retry intent, CSV safety |Synthetic HTTP/JDBC boundary and client-state tests |Real financial mutation/concurrency/rollback, actual browser and Test |
| Login/provider aliases |Native form with original Korean page copy, fixed same-origin login API and strict receipt, no arbitrary redirect, field preservation/clearing |HTTP five locales and client request/state contracts |Real browser/provider/session continuity |
| Register aliases |Native presentation, original field bounds, unchecked acknowledgements |Disabled HTML/client submission guard |Server consent/age persistence; registration intentionally unavailable |
| Recovery/reset/email verification/email change/account deletion |Native source-backed unavailable state; no invented mail or action success |HTTP/privacy/query nonreflection |Missing actual backend actions and delivery receipts |
| Shared support launcher |One56px dialog launcher with focus return and help/contact/DM links |Client open/close/locale preservation and native SSR |Actual global conversation UI, memory-only draft retention across internal page navigation |
| Support member API |Session/CSRF ownership, stable key,1000-codepoint validation, actual stored creation/reply receipts, no empty-success fallback |Isolated controller/service tests; real PostgreSQL CI9-case task passed at7cb9890d95 |Actual PostgreSQL owner/replay evidence, browser send/receive and administrator assignment/reply |
| Member direct-message API |Verified session/CSRF, existing owner-scoped functions, stable keys/body receipts, sequence string, truthful read errors |Isolated boundary/service tests; real PostgreSQL CI9-case task passed at7cb9890d95 |Recipient/opening flow, browser conversation UI, realtime/read/archive/block/report parity |
| Existing tools/calculators/status |Dedicated isolated presentation task in progress; native computation/status models retained |Worker regressions in progress; not yet integrated/certified |Independent review, integration and browser acceptance |
| Other shop/bank/stocks/work/quests/community/account/legal/admin destinations |Existing source inventory retained; not all ported by this checkpoint |No blanket functional claim |Per-route native rendering, complete control/API/data/receipt coverage and full QA |

## Acceptance procedure

For each page record its source owner and canonical/alias routes, guest/member/admin role, ready/loading/empty/error/denied state, all interactive controls, exact API request and source receipt, five locales and manual preference, narrow/desktop/zoom/keyboard states. Mark unavailable backend actions explicitly. A navigation link and anHTTP200 do not certify the destination or an operation.

For mutations, use an isolated test principal and fixture; verify owner, CSRF, stable retry key, exact intent and canonical receipt/readback. A repeated network request must not produce an additional effect. Money and chain sequences remain canonical strings. Never create illustrative balances/people/history as live data.

The pre-migration source inventory contained290 static HTML files covering147 concepts and many captured Next artifacts;180 design concepts and92 original contract routes are different inventories. None is an implemented-feature count. Keep uncovered families open rather than subtracting navigation links from a total.

## Known implementation limitations

- The existing registration API was not changed by the auth UI task. Native registration stays blocked until server-side consent/age evidence exists.
- Legacy sessions without a matching raw-proof cookie retain authentication but cannot bootstrap mutation proof. They require a valid new-session/proof path; no stored hash is rotated as a workaround.
- Support creation's legacy SQL replay does not bind body/subject. The Java service verifies actual recent100 owner-thread metadata and initial message. A very old retry outside that receipt window can be unavailable; it is never relabelled with new input.
- Unit/JDBC doubles cannot prove live grants/function parsing or concurrency. The separate CI-only9-case task passed actual service/function/app-role and sequential replay checks with rollback-only fixtures; simultaneous concurrency remains unverified.
- Existing stock test logs show scheduled source-unavailable/raw-read warnings in H2. These are not a passing production market-feed test; stock/realtime feature acceptance remains open.
- Earlier upload tests lacked storage isolation and may have written synthetic1×1 image fixtures into shared default media storage. The test profile now uses a temporary directory and enforces it; no unknown shared files were deleted. No shared database/financial mutation was performed.

## Checklist

- [x] Original design/spec/PR integration and task-branch checkpoints retained.
- [x] Home/admin hub/wallet/auth foundation implemented and reviewed as recorded in worklog.
- [x] Messaging controller/service fail-closed prerequisites implemented.
- [x] Read actual9-case disposable PostgreSQL CI outcome:9/9,zero skips; run44689405118.
- [ ] Integrate reviewed existing native public pages.
- [ ] Implement and review remaining native route families and global conversation interaction.
- [ ] Complete all browser/locale/responsive/admin/mutation acceptance rows.
- [ ] Fresh whole-branch review and current-main integration.
- [ ] Exact-source Test, session continuity/rollback and documented production release.
