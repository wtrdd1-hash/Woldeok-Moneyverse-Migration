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
- [ ] RED: reproduce false fallback and invalid response acceptance.
- [ ] GREEN: backend public source/status contract and frontend source validation/UI.
- [ ] MID: fetch main and plans, inspect A/B/QA overlap; run focused tests.
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
