# Development C v1250 — Public enterprise source integrity

Status: STARTED / DRAFT / RELEASE HOLD. Base: `f13bbce273ffc65e8576170992d82ea00c27a1c9`.
Branch: `auto/hourly-c-enterprise-source-v1250-20261101-0645`.

## Scope and source evidence
- Fresh `origin/main` renders fabricated fallback 365,000,000 WLD and three named SOEs on `/enterprises` when `/api/v1/enterprises/public` fails. It calls the response a real-time official disclosure and treats projected dividends as paid. This is P0 financial source misrepresentation.
- Existing Nest public endpoint reads enterprise tables and returns `disclosed_at` based on request time, not an actual ledger settlement receipt. No new money writes or table grants.
- Earlier closed/unmerged PR #1288 covered related behavior, but its changes are absent from current main. No active PR currently owns public enterprise disclosure. Do not overwrite A/B/QA work.
- Scope: fail-closed public backend contract; strict frontend response parser and truthful source/settlement labels; responsive accessible error/verified states; Android gateway error parity if relevant; regression tests. No financial settlement claim.

## Plan and checkpoints
- [x] START: miniPC 7 services active, development DB connected; inspect main, AGENTS, READMEs, canonical/KO plans, open PRs and CI; identify source gap.
- [x] RED: reproduce false fallback and invalid response acceptance.
- [x] GREEN: backend public source/status contract and frontend source validation/UI.
- [x] MID: fetch main and plans, inspect A/B/QA overlap; run focused tests.
- [ ] FINAL: exact-SHA lint/typecheck/build/tests/DB/security/CI and HTTP/E2E as possible; preserve HOLD on any failed gate.
- [ ] PR and end-state evidence; no direct main/Test/Production mutation unless every release gate passes.

## Verification and deployment
Pending. Skips are not passes. Main untouched; Test/Production untouched; no rollback required.

- [x] RED: frontend 3 failed, backend 2 failed; reproduced fake 365M fallback and missing source/status markers.
- [x] GREEN implementation: DB-sourced projections only; explicit not-settled marker; Nest 503; strict web/Android response checks; projected fractional WLD truncated before rendering.

## MID checkpoint (2026-11-01 06:46 KST)
- `git fetch origin main` returned unchanged `f13bbce27`; English/KO canonical planning unchanged on main. New open A #2272, B #2273, QA #2271 and C #2270 are unrelated to public SOE disclosure. Closed #1288 remains unmerged.
- TDD GREEN: frontend 11 tests (including Android invalid JSON/503 and exact 64-bit WLD) and Nest 2 tests PASS. SQL inspection on READ ONLY development PostgreSQL: existing projected dividends format is `108000.000000000000`; repository now explicitly truncates projected WLD to integer string for exact client formatting. No data mutated.
- Backend source remains direct legacy table read with current development `moneyverse_app` SELECT permissions (true on both SOE and private tables), not independently verified least privilege. P0 security gate remains HOLD until dedicated DB boundary audit. Do not add grants here.

## Gate failure and correction (06:47 KST)
- Checkpoint `29b3fb612`: `pnpm lint` FAILED with two `no-loss-of-precision` violations in negative test fixtures (intentional unsafe JS literal), 1,021 existing warnings. `pnpm typecheck` PASS; app-api 184 endpoints PASS. Replaced literals with `Number.MAX_SAFE_INTEGER + 2` to preserve the invalid-number regression without violating lint. All gates must rerun on new HEAD.

## Security-function follow-up (06:58 KST)
- Fresh isolated PostgreSQL 17.11 on migrations 002–317: 316 migrations PASS, `moneyverse_app` has **no direct SELECT** on `state_enterprises`/`private_enterprises`. Existing Nest direct-table public API would fail; this was a real integration blocker, not a reason to broaden table grants.
- New TDD RED 3 cases: missing DB-owned `getPublicDisclosure` and controller source call. Adapted closed/unmerged Backend B v533's SECDEF pattern as **new forward-only migration 318**, one atomic read function with app-role EXECUTE only, no new table grants or ledger mutation. Backend now consumes one database-owned disclosure. Re-run isolated PostgreSQL and exact HEAD gates.

## Real isolated DB integration (06:58 KST)
- First isolated retry hit an initialization race (`database ... does not exist` while Postgres was booting); fixed readiness to execute `SELECT 1` against the **target database**, not only `pg_isready`.
- Fresh network-disabled PostgreSQL 17.11: **317/317 forward migrations 002–318 PASS**, `SET ROLE moneyverse_app` can execute `enterprise_public_disclosure_v1()` and returns three SOEs plus `108000` exact projected WLD; direct SELECT on both enterprise tables is `false`, function EXECUTE `true`, ledger transaction rows `0`. Container removed. The new function is an actual DB-backed read, not a UI-only placeholder.
- Added isolated PostgreSQL regression tests guarded by an explicit loopback-only `_isolated` URL. No shared DB writes.

## End checkpoint / release decision (2026-11-01 07:01 KST)
- Main and English/KO canonical plans re-fetched unchanged `f13bbce273ffc65e8576170992d82ea00c27a1c9`. New A/B/QA PRs remain separate. No direct main changes.
- Isolated fresh PostgreSQL 17.11 317/317 migrations PASS; loopback-only isolated backend DB tests 3/3 PASS; `moneyverse_app` can execute the new function but cannot SELECT either underlying enterprise table. Containers removed. No ledger writes.
- Earlier code checkpoint `8d158dd8` lint PASS (0 errors/1,021 warnings), typecheck PASS, build PASS, app-api 184 endpoints PASS; frontend 2,912 PASS, backend 2,952 PASS/517 SKIP, contract/database tests PASS. **These full-suite results predate migration 318 and MUST NOT be counted as final exact-SHA certification.** Root `pnpm test` hit 180s timeout; later package suites completed. Full dependency audit FAIL 9 (1 low/8 moderate), production dependency audit PASS. Fresh HEAD revalidation and remote CI still pending.
- Official Test exact-SHA authenticated user E2E, edge HTTP robots verification, independent restore, security provenance and GitOps release gate NOT CERTIFIED. RELEASE BLOCKED. No merge, Test/Production promotion or rollback. Preserve all A/B/QA/Gemini branches and open PRs. Only this independent worktree/branch changed.
- Do not delete this branch until fully integrated or explicitly superseded. Final CI/HEAD evidence will be appended to Draft PR #2274 after revalidation.
