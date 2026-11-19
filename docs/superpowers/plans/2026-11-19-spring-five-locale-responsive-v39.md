# v2026.11.19.39.1 — Spring 5-Language Responsive Picker Execution Plan

Owner-approved overall goal: full desktop/mobile responsive Spring-only UI + five languages and automatic/manual switching; release gated by real browser and functional security.

## Scope / conflict boundary
Stack on existing v38 shared Java admin and Thymeleaf implementation, not on the concurrent v38 multi-screen worker. Only change `spring-backend/src/main/resources/static/mv-spring/v39`, existing v38 Java shared admin header+CSS headers and Thymeleaf common headers/status/hub, tests, bilingual planning/QA/logs. Leave `spring-backend/src/main/resources/static/index.html` and all other owner 8-page static HTML alone.

## Tasks
- [x] Read integrated plans and true `SUPPORTED_LOCALES` from frontend.
- [x] Establish isolated branch/worktree and START logs.
- [x] TDD RED pure JS locale resolution + url preservation + browser detection + English fallback; GREEN standalone pure module.
- [x] RED Java tests for native Spring actual template/admin header, one accessible mobile language picker, five choices and same-origin script CSP; GREEN CSS + front module wiring.
- [x] Auto detection, saved manual cookie, explicit URL override, Auto reset, fallback languages, no finance/currency mutation, safe query/navigation.
- [x] Java clean test bootJar, Node tests, real isolated random-port H2 HTTP native page, CSP and static resource, branch diff check.
- [x] Run real Chromium 10/10 on local synthetic UI fixture at 320/390/768/1440. Captures not required; actual Java/admin/finance visual parity NOT CERTIFIED.
- [x] Document exact source, limitations, English canonical/Korean second plan, 180-image matrix cross-links, changes, QA, MID/END. Recheck Gemini and main.
- [x] Published stacked DRAFT PR #3297 on Spring admin PR #3295; no Production promotion due missing authenticated finance/180 route/rollback gates.
\n## Release acceptance\n- Full 262 Spring Java + Node 7 + Spring H2 HTTP 5 + isolated Chromium 10 PASS. User whole-site goal remains open. Official authenticated Test/rollback and 180 route proof not available; no Production change.\n
PR: https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/3297. Do not auto-merge. Parallel core responsive member PR #3296 remains independent.
