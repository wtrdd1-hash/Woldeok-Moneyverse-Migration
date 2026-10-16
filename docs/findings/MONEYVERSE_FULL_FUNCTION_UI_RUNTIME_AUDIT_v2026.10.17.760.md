# Full Feature and UI Stability Audit — v2026.10.17.760

**State: CANDIDATE / RELEASE_BLOCKED.** Baseline source: `origin/main` commit `c2d4667b44c0222ed422cea2a59626a0a318face`; independent worktree branch `audit/full-feature-ui-v2026.10.17.760`.

## Authority and inventories

- Documentation governance: `docs/DOCUMENTATION_POLICY.md`; implementation authority: `docs/planning/PROJECT_PLAN.md`, then `docs/planning/INTEGRATED_PLANNING_MASTER.md`. Full-route acceptance: `docs/planning/FULL_ROUTE_UI_QA_SPEC.md` and emergency hold `docs/planning/EMERGENCY_FULL_UI_REAUDIT_SPEC.md`. Release: `docs/RELEASING.md`.
- Main web repo: 166 Next page templates, including 34 administrator and 31 dynamic routes; 135 static templates. Backend: 82 `*controller.ts` files and 554 HTTP method-decorator appearances (inventory only; this does not mean 554 working endpoints); 62 Next BFF API route files. Android repo `woldeok-moneyverse-app`: 171 files, 57 Kotlin sources, HEAD `ee97ddfc5a93d7198d2d1ee94bb5a13c3b62ebcb`. Android CI on that SHA reported success; no independent on-device test or emulator verification in this cycle.
- Actual selected runtime pointers at inspection: Production `v2026.10.16.717` / source `176ca04ecfbd673e7f1057cdf83a9b92ea8f8272`; Test `v2026.10.16.735.2`. Old `prod-v600` systemd instances continue to run but are not the selected production generation. Neither runtime is the audited latest-main source.

## Executed evidence (not five-pass acceptance)

| Check | Actual result | Limits |
| --- | --- | --- |
| Mini-PC service/DB readiness | Backend, frontend, Discord, Nginx active; dev DB reachable | Process health is not feature acceptance |
| Capacity | Root filesystem 81% used; separate data volume 56% used | Capacity trend and old generations require safe cleanup, not deletion by guesswork |
| Anonymous HTTP sweep | Production 135/135 and Test 135/135 static templates returned HTTP 200 | Login redirects, admin role, dynamic paths and business operations unverified |
| Chromium first render | Production 320px 135/135, Production 1280px 135/135, Test 390px 135/135; 405/405 status 200; 0 document-width overflow, 0 blank-main heuristic, 0 recorded page JS exceptions | First render only, guest state, not interactions/console network/5 passes |
| 44px target heuristic | At least one sub-44px visible clickable target in 135/135 pages per checked viewport | Includes inline links and non-primary desktop actions; classify before declaring all defects |
| Heading heuristic | Production 55/135 and Test 54/135 pages lacked rendered H1 in guest state | Includes legitimate login/error/permission shells; production `/` lacks H1 while current source and Test contain one |
| Initial source gate | pnpm offline frozen install, typecheck, frontend 1,255 tests, QA ledger test, Next build, lint all exited 0 | Does not certify database contracts or full role-based browser UI |

Browser evidence: mini-PC task artifact `artifacts/guest-route-smoke.json` and `artifacts/browser-route-sweep.json`, not committed, under `/srv/moneyverse-tasks/full-function-ui-audit-v760-20261017/`. Inventory SHA-256 `dc9997c85644ae47c380604d8e25e2539517a1a00dab4a408315067c02864e15`.

## Reproduced UI/source defects and isolated fixes

1. **TRUTH-760-01** — Home page mixed authoritative wallet data with literal +4.8% 24h, KRW 179,460,000 and fixed 62/28/10 portfolio splits. Replaced unverified personal figures with explanatory virtual-WLD disclosure and owner-specific wallet/stock/bank links; replaced absolute ledger-loss guarantee with neutral record-view wording.
2. **TRUTH-760-02** — Home top-movers synthesized four named quotes when upstream returns no stocks, and silently coerced malformed prices to zero. New `selectTopMovers` accepts only actual valid integer-safe quotes and shows an explicit localized unavailable state on feed failure. It never creates a financial quote.
3. **UI-760-03** — Shared notice close measured 24x44 at mobile width 320 (24x24 desktop); mobile menu trigger measured 40x44 at 320. Both are now 44x44 with notice bar height expanded to prevent clipping. Existing header regression updated to assert the new stronger mobile contract.
4. **RELEASE-760-04** — Latest source is not running in official Test/Production; v530 requires five complete authenticated passes of all 166 routes, including 34 admin pages, and role/viewport/fixture/interaction matrices. No such evidence was produced in this cycle.
5. **FINANCE-760-05 (P0)** — Current integrated master v737 reports 19 unexplained account/ledger projections totalling +4,779,188 WLD and app direct DML permissions on five financial tables. This cycle performed no financial writes, grants, schema migrations or guessed ledger repairs. Production release stays blocked.

## Execution and incomplete coverage

- TDD: `frontend/src/lib/home-market.test.ts` (3), `frontend/src/app/home-cockpit-truth.test.ts` (2), `frontend/src/lib/header-touch-targets.test.ts` (2). Assertions observed RED before GREEN. A test-environment file-system mocking issue was diagnosed and corrected before asserting touch-test success.
- The legacy `brand-responsive.test.ts` assertion expected the prior unsafe small-screen class; adjusted to assert the 44px default class. Full frontend tests, typecheck, build, lint re-run after changes; final exact results belong in the paired worklog.
- **Not verified:** authenticated member/admin write flows, admin 5 complete browser passes, 31 dynamic routes with valid/invalid/permission fixtures, non-destructive idempotent transaction behavior against isolated database, live backend API-by-API response contracts, mobile physical-device UI, Android local build (no Android SDK configured on mini-PC), full translation and 200/400% zoom matrices, Production mutation safety.

## Required next gates

1. Exact candidate-SHA lint/typecheck/full test and build, including backend and DB tests (no skipped required tests); independent CI PR review.
2. Isolated authorized Test backend/DB with verified source identity; full 166-route × 5 authenticated browser evidence, all 34 admin routes per pass, responsive/keyboard/locale and interaction states, dynamic fixtures.
3. Financial ledger/opening-balance reconciliation and least-privilege DML repair with immutable evidence, rollback backup, and signed-in session continuity.
4. Re-fetch main, reconcile concurrent commits, then only an accepted immutable zero-downtime rollout. **No Production cutover authorized or performed by v760.**
