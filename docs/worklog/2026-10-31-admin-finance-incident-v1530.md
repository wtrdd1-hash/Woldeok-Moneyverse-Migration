# v2026.10.31.1530 — Admin finance incident and stale-release banner triage

Status: IN PROGRESS / BRANCH-ONLY / NO LIVE FINANCIAL FIX OR DEPLOYMENT.

## START — 2026-10-31 KST
- Owner reports repeated failure on KDIC, NPS, bonds, state enterprises and policy. Five mobile screenshots show 503/uncertified reports and a large persistent version-refresh banner.
- Exact GitHub main baseline: `761a55a094fb9dd383d213e817305e68c79fa23c` (#2045). Isolated branch: `fix/admin-finance-incident-v20261031-1530`; do not edit other agents' branches.
- Read documentation hierarchy: `AGENTS.md`, `DOCS_INDEX.md`, `docs/DOCUMENTATION_POLICY.md`, `docs/planning/PROJECT_PLAN.md`, `docs/planning/INTEGRATED_PLANNING_MASTER.md`, `docs/RELEASING.md`, v1521 KDIC worklog and v1415 Treasury worklog; inspected relevant controllers and UI source. Historical worklogs are evidence, not current product authority.
- GitHub code source: KDIC 40 accounts/891 ledger transactions/1,829 postings and zero balance mismatch do **not** certify 552 of 552 unmatched legacy Treasury records. Pension, Treasury and KDIC mutating POSTs deliberately fail closed with HTTP 503 pending canonical double-entry proof; no fabricated payout, mint or balancing transaction permitted.
- Bond control tower reports unknown when GET/contract validation fails: precise runtime reason requires authenticated Test/backend response and cannot be inferred from a screenshot. Economy policy 7-day hold is a database eligibility rule, not proof of broken scheduling.
- `StaleTabNotice` always attributes a persistent release mismatch to *browser cache* without verifying the cause, blocks a large portion of 320px mobile viewport, and retries hard-navigation on click. Correct source-backed UX under an isolated, testable change; do not disable safety gates.
- Remote Desktop Commander devices `debian13`, `minipc` and `weoldog` all OFFLINE; no trusted SSH/DB/official Test or production release execution available from this conversation. Container cannot resolve github.com; use GitHub connector for source branch.
- Verification contract: source branch edits and CI statuses must be distinguished from actual authenticated Test/Production. Financial 503 remains until independent canonical reconcile and official promotion gates pass.

## WORK PLAN
1. Capture stale release-alert failure cases in regression tests before implementation; confirm RED in CI if possible.
2. Fix source: message acknowledges release identity mismatch without false cache diagnosis, provide mobile-safe nonblocking presentation, no reload loop or auth/session promises.
3. Recheck main and document remaining 503/bond/policy/root-cause gates with operator commands.
4. Run exact-SHA automated tests/build through available CI (or report unavailable) and create PR with internal/GitHub bilingual records.
5. Do not claim Test/Production promotion without direct host and database evidence.

## MID / FINISH
PENDING.

## MID — miniPC connection correction and exact runtime investigation (2026-10-31 12:06–12:12 KST)
- Earlier statement that the miniPC was unreachable was incorrect: only Desktop Commander devices were offline. The owner-named `@미니pc홍` MCP connects successfully to Debian 13, services, PostgreSQL 17.11 and remote shell. The owner-requested connector must be used first.
- Host main HEAD `d1f1d4494d14c2ab3dbf2c029fd9d161de8a5a92` contains two unpushed local commits after remote origin/main `761a55a094fb9dd383d213e817305e68c79fa23c`. Other developers' worktrees left untouched. Rechecked remote main before implementation and after the build; unchanged at `761a55a`.
- `moneyverse-live-prod-{backend,frontend}.service` both active with live process CWD `/srv/moneyverse-data/releases/prod-v2026.10.31.0950-761a55a094fb/{backend,frontend}`. Public `/frontend-version` and `/api/version` both return `95485a299885693e3becb694dfc36ad45e832f97`; frontend `.next/BUILD_ID` is also `95485a...` although release directory is labelled `761a55a...`. This is an identity/provenance anomaly requiring independent release attestation, not a demonstrated browser-cache root cause.
- Production release identity script `sudo -n node scripts/release/verify-host-runtime-identity.mjs --channel prod --sha 95485a...` exits 1: no environment files for inferred `moneyverse-release-v0950-backend.service`. Official Test frontend reports different SHA `c2129625...`. No verified exact-SHA Test.
- Authoritative DB via `@미니pc홍`: 891 ledger transactions, 1,829 postings, 40 accounts; 552 `system_treasury_ledger` entries, all 552 with NULL `ledger_transaction_id`; 0 certified `ledger_reconciliation_runs`. Five legacy vaults total **220,923,528 WLD**; 3 active bonds; 2 pension accounts, combined accumulated contributions **50,000 WLD**, 238 old pension payout logs and 0 bond coupon logs. A historic log alone cannot certify the canonical payment.
- Public `/api/treasury/overview` returns HTTP 503 with `PUBLIC_TREASURY_RECONCILIATION_PENDING`; it is not safe to turn this into HTTP 200 without solving journal/provenance. No database/money/config mutation was made.

## FINISH — isolated source fix, verification, residual blockers
- RED TDD with `NODE_ENV=test`: 3 expected failures, 6 PASS (false cache assertion, missing dismissal and responsive treatment). An initial run without `NODE_ENV=test` incorrectly invoked production React test-utils and failed for unrelated act() setup; corrected environment and reran RED before implementation.
- Changed only `frontend/src/components/stale-tab-notice.tsx`: replace unsupported cache diagnosis and absolute session-preservation guarantee with precise version-mismatch language; compact max-w-md mobile card instead of full-width large overlay; accessible close button; per-release-transition dismissal in sessionStorage; preserve manual refresh and future update checks.
- GREEN: 9/9 focused tests PASS; `pnpm typecheck` PASS across workspaces; targeted frontend ESLint PASS; `git diff --check` PASS. Initial Next full build OOM at artificial 1024 MB heap limit; retry with `NODE_OPTIONS=--max-old-space-size=1792` PASS (Next 16.4.2, two workers).
- Isolated frontend preview port 3891: `/`, `/frontend-version`, `/admin/bonds` and `/admin/pension` each HTTP 200, **HTTP-only**. The preview did not have `INTERNAL_API_TOKEN`, so authenticated API/admin E2E **NOT VERIFIED**; preview shut down, no official Test replacement.
- Full suite and real DB function-level payout E2E not run for this change. Finance POST 503, 552 Treasury canonical links, persisted reconciliation, bond API source error, policy 7-day constraint, actual Production source identity and official exact-SHA Test are NOT resolved. Do not describe the overall finance incident as fixed or deployed.
- GitHub draft PR #2131 tracks isolated branch. No Production switch or WLD write performed. Release status **SOURCE_VERIFIED / TEST and PRODUCTION HOLD**.
