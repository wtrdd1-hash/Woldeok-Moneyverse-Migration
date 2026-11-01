# C v1261 — Stock depth and trade source truth

## BEFORE WORK — 2026-11-01 13:46 KST
- Debian 13.6 miniPC seven services active; development PostgreSQL connected.
- Base `origin/main` `f13bbce273ffc65e8576170992d82ea00c27a1c9`; separate `auto/hourly-c-stock-depth-truth-v1261-20261101-1346` worktree. Existing root `implementation_plan.md` modification left untouched.
- Read `AGENTS.md`, README, Korean README, both planning master documents; checked active PRs, QA/A/B and recent CI. No active PR specifically covers synthetic stock orderbook and trade ticks.
- Evidence: `stock-orderbook.tsx` fabricates bid/ask volume, spread, intensity, recent executions from current price; `stock-market-toast.tsx` creates random trade notifications. `MarketBroadcast.publishOrderbook` has only test callers, no verified live producer.
- Security: never present generated volumes/trades as recorded orders; keep existing real stock trade API unchanged, do not touch ledgers or database grants.

## PLAN
- [x] RED: tests require an explicit unavailable depth contract and no synthetic rows, fake trades, or order entry based on fabricated quotes.
- [x] GREEN: NestJS 503 orderbook read contract; Next.js fail-closed read proxy; accessible responsive frontend showing quote-only with source status. Remove simulated trade toast.
- [x] Verify: targeted frontend/backend/route tests; full lint, typecheck, build, unit, integration, app-api, isolated PostgreSQL, security, E2E/CI as feasible.
- [x] Re-fetch main and plan, record exact SHA; draft PR only if blocked, no merge or deployment without all gates.

## IN PROGRESS — 2026-11-01 13:50 KST
- Worktree initialized; no production/Test changes.
- RED confirmed: backend `orderbook` method absent (1 failed / 55 passed); frontend depth role absent in standalone test (1 failed). Initial frontend run without `NODE_ENV=test` was invalid and rerun with the correct environment.
- GREEN implementation: Nest GET `/stocks/:id/orderbook` rejects unverified depth 503; Next proxy rejects missing/malformed/legacy upstream data and enforces private/noindex/no-referrer; UI displays quote-only, no synthetic volumes/pressure/recent trades; removed random trade toast.
- Backend focused controller 56/56 PASS. Frontend focused 14/15 PASS before quote grouping correction; latest rerun BLOCKED by `esbuild` service termination under simultaneous A/B lint/build pressure (memory available 603-780 MiB). Never terminate other workers.
- Mid-run fetch: origin/main advanced from `f13bbce27` to `561b78e74` via QA storage maintenance #2321, no overlapping source files; rebase before PR. Master planning docs unchanged in main.


## FINISHED — 2026-11-01 13:59 KST (release held)
- Candidate after first rebase: `ee109501cb14c9355892e8af06497e7af87651bf` against `561b78e74`; main subsequently advanced to `143190d3811a1a419bfdfb2bab968e34fee447df` (QA maintenance/docs only), rebase without conflicts to `630e0279a1d51fea8b59e5c6af76feec4341211b` before final log update. Final log commit SHA and post-commit gates are in PR #2322.
- Focused TDD: 15 frontend PASS, 56 backend PASS. Lint PASS 0 errors / 1,020 warnings. Full typecheck PASS. Backend and contract build stages PASS; Next.js frontend build timed out after 200 seconds under concurrent host load, full build FAIL/BLOCKED.
- Full frontend suite: EPIPE/esbuild worker interruption (no trustworthy aggregate). Full backend suite: Rust worker spawn `EAGAIN`/SIGABRT. These are **NOT PASS**; focused tests do not replace full suites.
- Mobile app-api contract: 184 endpoints PASS. Database package: 62 PASS / 4 SKIP. Isolated PostgreSQL 17.11: 316/316 migrations PASS; app role direct ledger INSERT false. Isolated container removed. No DB/schema/ledger modifications to shared stacks.
- Security scripts: 11 PASS; production high-or-above audit PASS (0 findings); full dependency audit FAIL (1 low + 8 moderate). Full route QA FAIL (`artifacts/qa/full-route-ledger.json` absent).
- Remote CI for first candidate: classify/policy/release-input PASS; runtime-check FAIL on existing admin console session fixture assertions (2 tests); second verification runtime-check pending. QA #2303 owns session fixture repair. New SHA CI must be assessed independently.
- Official exact-SHA Test backend/API/DB/auth/user flow, real browser E2E, independent restore, merged-SHA revalidation: BLOCKED/NOT RUN. No main merge, no Test/Production rollout, no GitOps change, no rollback necessary.
- Draft PR #2322; preserve unique branch/worktree, no other PR/branch deletion. A/B/Gemini/QA worktrees and five core reservations untouched.
- Final decision: PARTIAL / RELEASE BLOCKED. The visible fabricated depth/trades are removed in candidate only; real orderbook feature is NOT implemented.
