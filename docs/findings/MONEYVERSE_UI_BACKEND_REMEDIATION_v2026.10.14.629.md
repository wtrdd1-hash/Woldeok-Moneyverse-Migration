# UI / Backend Functional Truth Remediation — v2026.10.14.629

**Status: PARTIALLY IMPLEMENTED / RELEASE BLOCKED.** This is a code change on isolated branch `fix/ui-backend-truth-v2026.10.14.629`, not a completed implementation of all economic systems and not a Test or Production release.

**Authoritative specification:** `PROJECT_PLAN.md`, `INTEGRATED_PLANNING_MASTER.md` (v530 / AUTHORITY_DRIFT), documentation policy, and audit draft [v628 PR #832](https://github.com/wtrdd1-hash/Woldeok-Moneyverse-Migration/pull/832). Initial/mid/final remote `main=d4f9cc1978bea6ee1a0e904005fa418cd159b4cd` (subject to final check).

## Changes implemented

| Audit IDs | Corrective implementation | Remaining gap |
|---|---|---|
| UX628-01, 07, 09 | `/api/admin/treasury/grants` now delegates role verification to the guarded Nest `/api/v1/admin/security` and requires an **open elevated console**. It no longer seeds demo applications on GET or silently writes fake approvals. All POST decisions return HTTP 503, and the authorized admin page only shows stored legacy applications with a suspension notice. Admin navigation now exposes the page to authorized users. | Real applicant identity, CSRF/re-auth and durable DB audit, idempotent atomic payment + receipt must be implemented before granting operational POST access. Old data is unverified; file-based submission stays suspended. |
| v603 claim gap | `/api/treasury/claim` rejects with HTTP 503 instead of claiming WLD credited. `/api/treasury/apply-grant` new POST also rejects with 503 instead of anonymous fixed-ID JSON persistence. | Real ledger settlement, application ownership and durable transactional write required. |
| UX628-02,03 | Venture UI prominently declares simulated WLD, and creation/IPO/dividend/vote controls no longer mutate a browser-only balance or claim real execution. Mock backend venture financial POST handlers explicitly reject with 503. | Backed user-bound investments, capital conservation, settlement receipt and UI wiring remain unimplemented. |
| UX628-04 | Demo `/marketplace/auction` bid and buyout no longer alter phantom balances, fees or listings; a clear preview notice links to the separately implemented **real** auction in `/marketplace` and `marketplace/auction-view.tsx` (uses Nest auction listing/bid API). | Verify the real auction path end-to-end with authenticated escrow/CSRF, concurrency and ledger checks; no live E2E claimed. |
| UX628-05, 06, 12 | Quant, warfare and derivatives UI show preview notices and suppress misleading execution. Their fake backend financial commands return HTTP 503. Read-only sample information remains simulated. | Real strategy persistence/order execution, club state and derivatives margin/liquidation require independent Economy Core design and acceptance. |
| UX628-08, 10 | Added `/admin/blog` to admin navigation **and** elevated page guard; added `/admin/treasury/grants` and a kimchi-premium calculator base link to discoverability. | Full role-based mobile navigation and SEO acceptance unverified. |
| UX628-11 | Not modified: prior v530 mobile clipping and identity API 500 require their own verified work. | Remains BLOCKED. |

## Verification evidence

- TDD source-level contract checks: **10/10 pass**; grants HTTP handler Vitest: **4/4 pass**; backend controller rejection Vitest: **4/4 pass**; updated auction component: **3/3 pass**.
- Frontend TypeScript `tsc --noEmit` and backend `tsc -p backend/tsconfig.json --noEmit` passed against read-only cached dependencies; changed-file ESLint 0 errors / 97 warnings in intermediate run. Warnings are not a release acceptance.
- Initial full frontend suite ran under inherited `NODE_ENV=production`, causing React 19 `React.act` failure (382/1173 failed), not valid evidence of functional success. Corrected to `NODE_ENV=test`: **1134 passed, 39 failed** of 1173; after this run, the obsolete preview-auction expectation was updated and its targeted 3/3 passed. The full suite has **not** been re-run after that update; ~38 other failures still require baseline comparison and correction.
- No full end-to-end signed-in user/admin flows, migration/ledger tests, CI or exact-SHA isolated Test runtime acceptance; **no Production promotion**. No live member balances or DB mutated.

## Required release gates

1. Bring full current-main frontend and backend checks to green, including known v530 UI/admin/identity blocker and clean exact-SHA CI.
2. Validate user/anonymous/operator API negative tests and live auction bid/settlement on isolated Test with rollback plan and audit evidence; no real balances on production.
3. For any real grant/venture/quant/derivative execution, create approved SECURITY DEFINER ledger-backed design, migrations and financial invariant tests before enabling the endpoints.
4. Only after Test backend/DB/frontend pass on the same immutable SHA, perform an approved zero-downtime production promotion; until then keep these changes in draft review.

All routes returning 503 are deliberately suspended **functionalities**, not completed replacements.
