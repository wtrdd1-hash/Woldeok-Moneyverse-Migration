# C v1255 — Advisor source truth and execution hold

## Before work — 2026-11-01 09:45 KST
- Host Debian 13.6 connected; seven services active; dev PostgreSQL connected.
- Base `f13bbce273ffc65e8576170992d82ea00c27a1c9`, isolated `auto/hourly-c-advisor-source-truth-v1255-20261101-0945` worktree. Reviewed AGENTS, EN/KO README and living plans, open PRs, A/B and QA v1433; no open advisor PR.
- P0 proof: `/api/advisor/deoki/rebalance/execute` returns fabricated `success:true`, `SIMULATED_FILLED`, 1,200,000 WLD and invented execution IDs without ledger execution, while `/advisor` claims immediate filled trades. Backend advisor diagnosis requires a durable receipt INSERT, so no fallback should be invented if source unavailable.
- Scope: refuse all unledgered rebalance executions; make advisor diagnosis a validated read-only source view with honest unavailable state; remove fabricated ratios/yields/AI guarantees; add regression tests for authentication, private headers, source shape, mobile and accessibility. No DB grants, money writes or Production changes.

## Plan / checkpoints
- [x] RED: reproduce fabricated rebalance and unsafe diagnosis contract with failing tests.
- [x] GREEN: fail-closed rebalance endpoint and validated diagnosis BFF; accessible honest UI.
- [x] Execute exact candidate gates and document failures; re-fetch main, preserve HOLD on any blocker.

## In progress
- Pending.

## Finished — DRAFT / RELEASE HOLD (09:59 KST checkpoint)
- Current main did not contain the v1216 local-only advisor hold (#2117); this independent PR restores the safety boundary without deleting the older branch. A real diagnosis still requires owner-scoped durable receipt capability (#2118).
- Isolated PostgreSQL 17.11: 316/316 migrations applied; app role cannot INSERT `ai_financial_diagnoses`, can EXECUTE `stock_my_positions(uuid)`; ledger transactions/postings 0/0. Test container stopped and removed.
- Candidate initial gate run at `dc22ae935d32999a0d8b65ca18da743e58e0fa89`: full Lint PASS (0 errors/1019 warnings), Typecheck PASS, app-api 184 PASS, contract 41 PASS, database 62 PASS/4 skipped, production dependency audit PASS. First Next build failed with shared-host Rayon EAGAIN; bounded `RAYON_NUM_THREADS=1` retry PASS.
- Full frontend 2907 PASS / 2 FAIL (pre-existing admin console fixture expired at 2026-11-01 00:00 UTC, tracked by QA #2292). Full backend suite was interrupted by Vitest child EPIPE under shared-host process pressure, not certified PASS. All-dependency audit 9 findings (8 moderate/1 low). Full-route QA missing `artifacts/qa/full-route-ledger.json`. Official exact-SHA Test and authenticated user E2E not certified.
- Isolated standalone HTTP confirmed GET `/advisor` 200, diagnosis GET 503, cross-origin POST 403. It also exposed Next Request.url normalization causing valid Host origin POST 403; RED 2, GREEN 15 focused tests after a Host / forwarded-proto origin correction. Actual edge still overrides private robots/referrer headers with index/follow (#2225); SEO HTTP gate FAIL.
- A/B/Gemini/QA worktrees, main, DB, Test, Production, GitOps and all five hourly automations unchanged. No merge, deploy, rollback or branch deletion. Draft PR #2295 remains HOLD. Final exact HEAD verification and CI status will be attached as a PR comment after the last commit; no release approval implied.


### In progress — 09:49 KST
- RED reproduced 9 failing assertions against original fabricated execution / diagnosis contract (evidence `tdd-red.log`).
- GREEN: authenticated rebalance now HTTP 503, anonymous 401, cross-origin 403, no generated trade receipt; BFF diagnosis validates a durable backend receipt and internally consistent safe-integer WLD, maps only owner-safe read-only fields; UI no longer promises live Sharpe, returns a keyboard/assistive-technology friendly error/retry and verified as-of values.
- 13 focused tests PASS (including jsdom retry, authenticated view, missing consent); targeted eslint and frontend TypeScript PASS. First parallel test run hit shared-host worker starvation, rerun with one worker PASS.
- Midpoint fetch origin/main remains `f13bbce273ffc65e8576170992d82ea00c27a1c9`; EN canonical planning header unchanged. No overlap with current A/B/QA PR inventory.
