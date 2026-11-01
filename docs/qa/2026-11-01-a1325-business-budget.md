# QA — A1325 Member Business Catalogue Exact WLD Cost Cap (2026-11-01)

**Disposition: DRAFT / RELEASE HOLD.** Code candidate `d298e6bedd962a18c54b7e416e185d328c907fb0`, baseline `origin/main` `f13bbce273ffc65e8576170992d82ea00c27a1c9`, PR #2320. Final documentation commit will create a new exact HEAD requiring fresh CI; never equate code SHA with final HEAD without rechecking.

## Product and source

- Authenticated/consent-current member GET `/businesses?maxCost=<canonical-WLD-integer>` renders a labelled 44px GET search and distinguishes invalid filter, source failure and verified no match. A budget is **not** actual cash/equity/affordability. Existing owned business summary, purchases, idempotency and settlement remain unchanged.
- Nest `GET /api/v1/business-types` and Android alias `GET /api/v1/businesses/catalog` reject duplicate/empty/noncanonical/oversized budgets with 400; no filter remains backwards compatible. Controller excludes owned types from the returned catalogue.
- `PostgresBusinessRepository.catalog(maxCost)` filters the existing `public.business_catalog()` SECURITY DEFINER read model with a bound `bigint` and numeric ordering. No new migration, direct table grants, financial write or balance conversion through JS Number.
- Android `/app-api/v1/businesses/catalog` validates query and filtered HTTP 200 budget evidence, fails closed 503 on missing/malformed/out-of-cap results, and applies `private, no-store`, `noindex`, `no-referrer` on owner business responses including errors. Member Next page is noindex.

## TDD and local evidence

- RED: missing web budget parser, missing Android input/response guards, missing Nest maxCost propagation, missing SQL budget filter, numeric sort output-alias error; RED logs in task directory. Nest test harness initially lacked CsrfGuard override; corrected before evaluating RED.
- GREEN before final docs: backend budget 10 PASS; frontend parser 11 PASS; Android gateway 3 PASS; Next server-page forwarding 3 PASS. These are targeted/mock tests, **not** official authenticated E2E.
- `pnpm typecheck`: PASS. `pnpm lint`: 0 errors, 1022 warnings on first full run. `pnpm --filter @moneyverse/backend build`: PASS. Full exact-code SHA gates are logged separately; update this section from `full2-gates-status.txt` before final commit.
- DEV PostgreSQL 17.11, read-only transaction `SET LOCAL ROLE moneyverse_app`: `public.business_catalog()` EXECUTE true; nine active types; exact cap 9007199254740993 includes nine, cap zero includes zero; numeric ordering `STALL 2850`, `CART 4750`, ... `LOGISTICS 1140000`; transaction ROLLBACK. EXPLAIN ~0.172ms on nine rows only. No mutation or production DB access.
- **P0 FAIL:** effective DEV `moneyverse_app` direct `account_balances UPDATE`, `user_items DELETE`, `users SELECT`, `virtual_business_types SELECT/UPDATE/DELETE` all true; inconsistent with least privilege. Does not prove Production ACL. Issue #993 updated.
- Mixed first gate run: frontend build canceled 143 during superseding repair; full backend/frontend EPIPE due shared-host process/thread exhaustion; not PASS. DB unit 62 PASS/4 SKIP; app-api contract 184 endpoints PASS; security advisory tests PASS. These mixed-SHA results are not accepted as final full gates.

## Branch and release protection

- Start remote heads 89, open PR 85. Mid audit remote-tracking refs 91 including origin/HEAD alias; actual 90 heads, 89 unmerged non-main, 0 fully merged non-main, 87 open Draft PRs, 0 reported conflicts. No branch deletion, including all unique unmerged changes. Final counts must be refreshed.
- Overlapping files with C PR #2257 (`frontend/src/app/businesses/page.tsx`) and C PR #2318 (`frontend/src/app/app-api/v1/[...path]/route.ts`); do not overwrite either, reconcile on integration.
- Official Test public `/api/version`: `bc8cd8a6c654af0336f550643f23049a58ee1d16`; Production public backend `/api/version`: `353c6d5d6ddbc14b1067e84f9c4a127bab1c3834`. Neither serves this candidate. Official Test exact-SHA auth/browser/Android E2E and immutable release identity, independent restore, P0 ACL and finance reconciliation are **BLOCKED**.
- Production/official Test deployment, main merge, schema change, service restart, branch deletion, rollback: **none**. No Production promotion authorized. Retain previous verified runtime generation; rollback not needed because nothing was deployed.

**Evidence directory:** `/srv/moneyverse-data/tasks/mv-a-20261101-1325-business-budget/` (`main-start.sha`, branch/PR/CI snapshots, RED/GREEN, full2 logs, real-postgres, public version probes). Final exact SHA, gates, branch count, CI and changed files to be appended.

## Final local gate evidence — exact code SHA d298e6be (13:39–13:47 KST)

| Gate | Result |
|---|---|
| Contract build | PASS |
| Full typecheck | PASS |
| Full lint | PASS — 0 errors / 1,022 warnings |
| Backend build | PASS |
| Frontend Next build | PASS — 603 static pages |
| Backend full test | **FAIL/INCOMPLETE** — two profile owner-only HTTP 401-vs-200 assertions and subsequent worker EPIPE; no full PASS count |
| Frontend full test | **BLOCKED/ABORTED** — host Node worker thread creation failure; terminated **only this task's own** hung Vitest process (exit 143) to protect other services |
| Database unit | 62 PASS / 4 SKIP (skipped DB integration not a pass) |
| Android app-api contract | PASS — 184 endpoints |
| Security advisory floors | PASS — 11/11 |
| Production dependency audit | PASS — no known vulnerabilities at run time |
| Backend budget HTTP/SQL targeted | PASS — 10/10, including private headers |
| Frontend budget/parser/app-api/server-page targeted | PASS — 17/17 after restoring Vitest node environment annotation; previous combined run 14 PASS/one suite failed, not a pass |
| SEO private route/sitemap regressions | PASS — 9/9 |
| Accessibility | Semantic label, `role=search`, `aria-describedby`, `role=alert`, 44px target class assertions PASS; browser/320px/200% keyboard E2E **NOT RUN** |
| Real DEV PostgreSQL | PASS read-only SQL and numeric ordering, ROLLBACK; owner/foreign-owner integration **NOT RUN** |
| Official Test exact SHA/auth E2E | **BLOCKED** — Test serves bc8cd8a6, not candidate |
| Production promotion | **HOLD** |

Unchanged `origin/main` `f13bbce273ffc65e8576170992d82ea00c27a1c9` independently reproduced the exact two profile test failures: 6 PASS / 2 FAIL, expected 200 but received 401. This isolates the profile assertion failures as pre-existing, not proof that the entire candidate backend suite passes. Existing repair work is owned elsewhere; A1325 did not overwrite it. The host worker EPIPE/Node thread failure remains a separate resource gate (#2171).

Final remote heads: **90** (main 1 + non-main 89), open PR **87** (all Draft), reported conflicts **0**, duplicate PR head SHAs **0**, failing-check PRs **23** in end snapshot. All 89 non-main branches were unmerged in mid audit; no safe fully merged non-main branch identified. Deleted **0**, preserved **89**. Final code/test diff before these records: **11 files**. New documentation files are additional. Final commit SHA must be read from the PR after push.

**Exact-code GitHub CI:** candidate-image run `41273907943` and CI run `41273911891` were still executing their Test steps at 13:46 KST. Prior code SHA `c6838b06` failed Next PageProps, repaired; `d5086219` superseded/canceled. Final documentation SHA will trigger fresh exact-head CI; none of these statuses can be promoted to PASS by inference.

**Runtime provenance:** Test Backend+Frontend public SHA `bc8cd8a6...`; Production Backend `353c6d5d...`, Production Frontend `/frontend-version` returned timestamp-like `1793450413898`, not a verified commit SHA. No exact-source Production proof, no Test deployment, no Production deployment, no rollback.
