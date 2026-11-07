# C v1248 — Virtual stock portfolio source and receipt truth

## Before work
- [x] Connected to Debian 13.6 miniPC; all seven services active, development PostgreSQL connected.
- [x] Fetched origin/main and read AGENTS, README, Korean guide, English canonical/Korean planning, and current A/B/QA/Planning/C pull requests.
- [x] Confirmed distinct gap: portfolio accepts missing holdings as verified empty; the page renders a weekly receipt with hard-coded week, inferred trades, fabricated fee burn and diversification score. This is not a ledger-backed receipt.
- [x] Existing authenticated Nest endpoint GET /api/v1/stocks/portfolio is owner scoped and backed by public.stock_my_positions(uuid). No new DB privileges or writes needed.
- [x] Isolated worktree from current main. No changes to shared main.
## In progress
- [x] RED: regression tests for malformed/missing/duplicate/mismatched holdings and fabricated receipt.
- [x] GREEN: fail-closed validation and remove invented receipt, improve member retry/a11y/freshness copy.
- [x] Run available local gates and isolate PostgreSQL; unresolved gates explicitly held.
## Finished
- [x] Record test evidence, release HOLD and preserve independent worktree and branch. GitHub PR records final SHA.

### Midpoint
- RED observed three source/receipt assertions fail before implementation; GREEN focused suite 13/13 PASS.
- Frontend typecheck PASS after JSX and receipt-null fixes.
- PostgreSQL contract: public.stock_my_positions(uuid) returns caller-only UUID, bigint strings and quantity*current_price; halt receipt endpoint returns last 50 owner records from migration 221.
- Removed unjournaled weekly financial receipt (fixed week 41, fake turnover/trades/fee burn/score). Strict source validation and explicit unavailable states, verified halt-only trades, 44px controls, keyboard retry.
- Existing #2225 private HTTP header PR remains separate; no duplicate edits.

### Verification and release disposition (initial candidate)
- Baseline origin/main: `f13bbce273ffc65e8576170992d82ea00c27a1c9`, refetched at start/mid, unchanged before PR preparation.
- Focused RED: 3 failures before implementation. GREEN: frontend portfolio/source 13 PASS; backend stock-halt repository contract 10 PASS.
- Frontend typecheck PASS on implementation prior to final small accessibility/status changes. Whole-repo lint PASS (0 errors, 1,022 pre-existing warnings); changed-file lint PASS (0 errors).
- Isolated network-disabled PostgreSQL 17.11: 316/316 forward migrations PASS. `moneyverse_app` EXECUTE `stock_my_positions(uuid)` true; direct stock positions SELECT false; ledger INSERT false. Owner query executes with 0 fixture rows.
- Existing security finding: migration 221 grants direct SELECT on `virtual_stock_halt_settlements` to the application role; authenticated Nest repository filters `WHERE user_id = $1` and `LIMIT 50`, but DB-level least privilege is not established for these receipts. Track under existing issue #1928/#828; do not add broad privileges.
- Whole-repo typecheck/build/test attempts were resource-blocked by `Cannot fork` while another A worker was building; no PASS asserted. Next.js compiler reported success but complete build was not certified. Revalidate exact commit when resources permit.
- Production-only high-severity audit PASS; full audit FAIL (9 vulnerabilities: 1 low, 8 moderate).
- Full-route QA ledger check FAIL: missing `artifacts/qa/full-route-ledger.json`.
- Official authenticated exact-SHA Test E2E, independent restore, required remote CI and release gates remain pending/BLOCKED. No main merge, Test deployment, Production promotion or rollback.
- Existing issue #1928 describes an earlier unmerged local C v1174 attempt at this same bug. This independent latest-main implementation is a replacement candidate; preserve the earlier unique work until equivalence and merge are proven.
- No modification to A/B/QA/Gemini worktrees, shared databases, GitOps or automation schedules.

### Review-driven hardening and complete local gate rerun
- First candidate HEAD `0af1aade90b6ea210eea84a3b9b3869424529acb` (before the final regression) passed full lint (0 errors, 1,017 warnings), typecheck, build, API contract, all unit/integration suites: frontend 2,910 PASS; backend 2,950 PASS / 517 SKIP; contract 41 PASS; database 62 PASS / 4 SKIP.
- Review found an additional edge: a zero-quantity/zero-refund record marked `settled` would still be presented as paid. RED 1 failure reproduced, GREEN verified after rejecting non-positive settled quantity/basis/refund.
- Added four server-rendered authenticated-page integration regressions covering unavailable vs empty sources, independent receipt errors, halted-trading controls, quarantined refunds, and settled positive refund.
- Final commit requires exact-HEAD rerun of all local gates; release remains HOLD regardless of local success because audit, route-ledger, private HTTP headers, official Test E2E and independent restore remain unresolved.
