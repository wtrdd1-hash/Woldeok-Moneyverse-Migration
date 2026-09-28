# QA Audit Report V477 — Full Feature / Page / Screen Sweep

> Version: v2026.09.28.477
> Date: 2026-09-28
> Candidate: `44933fd7abe83284e067c85115bf7ac1033cc895` (v476 main)
> Android baseline: `44288fccb321b5df889ca099989cb9afd350979c`
> Result: **BLOCKED — do not use this run as Production promotion evidence**

## Executive result
The current source contains **108 page routes, 24 administrator routes, and 12 dynamic page routes**. This is materially larger than the historical 86/22/8 snapshot, so the v473 ALL_GREEN report is historical evidence only.

The five-pass guest browser sweep covered 540 route/view rows at 320, 390, 768, 1024, and 1440 CSS px. No page-level horizontal overflow was reproduced. The first sweep produced 29 `ERR_ABORTED` rows caused by redirect/prefetch navigation collision in the shared browser page; all **29/29 passed** when rerun in isolated contexts, with zero overflow and zero page errors.

This is not a full acceptance pass because authenticated administrator/member/restricted/owner fixtures, all dynamic valid/permission scenarios, the complete responsive/zoom matrix, and Android instrumentation were unavailable. Static and automated release gates also contain real failures listed below.

## Candidate and runtime
- Web `origin/main` remained `44933fd7...` at start, mid-work, and final recheck.
- App `origin/main` remained `44288fcc...`.
- Production and Test services were active; backend `/health` returned 200 on both.
- Active release symlinks resolve to `prod-v476` and `test-v476`.
- Test/Production frontend version IDs were observed, but no durable release metadata mapped those IDs to the Git SHA, so exact-SHA runtime identity remains an evidence gap.

## Web automated gates
| Gate | Result | Evidence |
|---|---|---|
| Route inventory | PASS | 108 pages / 24 admin / 12 dynamic; inventory SHA `922ce3006e61ec6c9f81e473e457594901b881418a522755663eaad4ec1cea01` |
| Route ledger verifier unit tests | PASS | 3/3 |
| TypeScript typecheck | PASS | all workspaces |
| Production build | PASS | Nest build + Next production build; 120 static generation units completed |
| Root lint | **FAIL** | 453 findings: **89 errors / 364 warnings** |
| Root test/release gate | **FAIL** | mobile API contract drift |
| Contract package tests | PASS | 23/23 |
| Database package tests | PASS | 7/7 |
| Backend tests | PASS/PARTIAL | 1,018 pass; 391 DB-dependent tests skipped |
| Frontend tests | **FAIL** | 927 pass / 1 fail; 6 unhandled post-test errors |

### Confirmed release-gate defects
1. **Mobile API contract drift** — generator adds 84 lines across three maintained artifacts: 70 in `docs/mobile-api-contract.json`, 7 in each schema reference language file. The generated schemas add nullable `authorUserId` fields. `pnpm test` therefore fails before workspace test completion.
2. **Frontend i18n corpus test failure** — `src/lib/i18n/corpus.test.ts` requires `references/corpus-150k.json`, but the file is absent. Result: 1 failed test.
3. **Frontend test hygiene** — Vitest reports 6 unhandled `window is not defined` exceptions after calculator test environments tear down; multiple React `act(...)` warnings and jsdom canvas warnings are also present.
4. **Lint gate failure** — root lint reports 89 errors, including product source/test errors and root ESLint applying browser/TypeScript assumptions to `skills/brainstorming` CommonJS helper scripts.

## Browser screen sweep
- Test URL: `https://test.easy-scraping.com`
- Passes: 5
- Viewports: 320x800, 390x844, 768x1024, 1024x768, 1440x1000
- Rows: 540
- Horizontal overflow reproduced: **0**
- Initial navigation-abort rows: 29
- Isolated rerun of those 29: **29 PASS / 0 FAIL / 0 overflow**
- Original response distribution: 481 HTTP 200, 30 HTTP 404 dynamic/not-found rows, 29 navigation-aborted rows later cleared by isolation retry.
- Administrator login redirects were observed in guest state. Guest-visible shell/title rendering is **not** administrator acceptance.

### Browser coverage limitations
The authoritative QA contract additionally requires 360/375/412/430 widths, representative landscape, 200% and applicable 400% reflow, correct role fixtures, local tabs/dialogs/actions, success/error/loading/permission states, and deterministic dynamic-route valid/not-found/permission scenarios. Those requirements were not all satisfiable in this run, so the route ledger cannot legitimately be marked complete.

## Android QA
- Exact app main isolated worktree used.
- Unit tests: **25 pass / 0 fail**.
- Android lint: **PASS**.
- Kotlin/Java compilation used by the unit test task: **PASS**.
- `assembleDebug`: **BLOCKED** because the configured signing keystore is intentionally not present in the isolated source worktree.
- Device/instrumentation/UI: **BLOCKED**; no online ADB device/emulator was available.
- Static UI inventory confirms the current five-tab scaffold (Home, Economy, Play, Community, My) plus conditional Admin and supporting Auth/Capability/Seasons/detail surfaces, but static discovery is not runtime UI acceptance.

## Promotion decision
**BLOCKED. No Production promotion was performed.** A green promotion claim requires at minimum:
- resolve API contract drift;
- resolve the frontend corpus test and unhandled-test errors;
- make lint gate green or explicitly correct its scope/configuration;
- run DB-dependent tests against an isolated QA database;
- provision deterministic member/restricted/owner/admin Test fixtures and run the authoritative 5-pass role/state ledger;
- finish the remaining responsive/zoom matrix;
- run Android assemble/instrumentation in an authorized signing/device environment;
- bind Test release evidence to the exact candidate SHA.

No product code or Production runtime was changed by this QA work.
