# v2026.10.18.901 — Independent full-function live recheck

**English canonical** | [한국어](2026-10-18-full-function-recheck-v901.ko.md)

## Before work — 2026-10-18 KST
- User again requests all functions be verified (last message trails off after '그리고'). This run treats audit as all-feature, with banking priority; no unstated production promotion authorization inferred.
- Starting `origin/main=fe689c4bcd9acdea40755f9ff08ba446bdeeb1c8`, Production/Test publicly serve `e54e6843df27e01c00e0d409ddb9818f754d2c4c` at initial observation; they are not latest main.
- Prior v851 / v852 audit PRs #931 / #932 were closed without merge. v804 permissions and v806 bank deposit routing have since merged; re-test actual rather than reusing prior findings.
- Governing docs: `AGENTS.md`, `DOCS_INDEX.md`, `docs/planning/INTEGRATED_PLANNING_MASTER.md`, `docs/planning/PROJECT_PLAN.md`, `docs/DEVELOPMENT_STATUS_AND_MASTER_REFERENCE.ko.md`, `docs/DOCUMENTATION_POLICY.md`, `docs/RELEASING.md`, `docs/api/02-wallet-and-banking.md`, v804/806 release notes. Other agents have active worktrees; never alter shared root untracked QA scripts.
- Will use isolated source, authenticated requests only when safe fixtures exist. **NO Production user money writes, retries, privilege change, live schema change, release switch, or mislabeling of 200 as authenticated success.**

## In progress — evidence from real miniPC runtime
- Exact active Production/Test public SHA `e54e6843`; remote main `fe689c4`. v851/v852 PRs #931/#932 closed unmerged; newly merged v804 ACL and v806 source deposit route verified separately.
- Read-only Production financial readiness exit **2, BLOCKED**: 40 balance rows, 19 unexplained projections +4,779,188 WLD, five without posting +2,627,807 WLD; remaining app direct DML on three core financial tables, while ledger 2 tables now deny direct writes.
- Pocket SQL `bank_transfer_pocket` and `bank_archive_pocket` unchanged and dangerously journal-bypassing; create function lacks durable replay, so source-only request compatibility is not full financial correctness.
- Exact privileged Production v805 host runtime identity exit **1** despite all six SHA values matching: Production manifest `channel:"test"`, should be `prod`. Exact Test host identity exit **0**. No live manifest edits.
- Existing v234 '5-pass 100% browser QA' source inspected: viewport and high-WLD 'stress' only HTTP/regex, and admin check unauthenticated header + HTTP 200; not member, admin or mobile acceptance.
- Independent concurrent 278 public GET probes (135 actual static routes + 4 dead CTAs × 2 public hosts): per host 124 x 2xx, 11 x 3xx, four known CTA targets 404, no 5xx/network timeout. Additional 28 anonymous GET probes covering banking/wallet/chat/engagement/admin guards and public APIs. All evidence per path in `docs/qa/v901-public-http-sweep.json`. Dynamic 31, login/API mutations not checked.
- New announcement defect: both public hosts `/api/v1/announcements` 404 vs `/api/v1/content/announcements` 200 and real published JSON. Four live frontend callers used the wrong path. RED 4 calls, fixed in candidate, GREEN all four plus backend route control.
- New strict bank tests RED 3 backend, RED 6 frontend. Four authored CTA source tests RED 4. Candidate forwards valid per-action UUID, normalizes `IN/OUT`, DTO optional target, flat 100 WLD theme, 500 WLD archive fee and destination link repair, warning copy truth. Focused GREEN backend 3, frontend request 6, bank UI 4, CTA 4, announcements 5.
- Baseline main all local tests/typecheck/lint/build exit 0. After candidate bank/link changes exact source all lint/typecheck/test/build exit 0 (backend 1,260 pass/397 DB skipped, frontend 1,281 pass, contract 31 pass, DB pkg 9 pass/3 skipped). Package root `pnpm test` now includes both new route/announcement contract regressions. New announcement patch final exact-source full gates separately executed and recorded.
- Android separate repository main `ee97ddfc` most recently verified green for debug unit/build; no device or mobile authenticated bank receipt acceptance.


## Finish — candidate and release disposition
- Findings [English](../findings/MONEYVERSE_ALL_FEATURE_RUNTIME_RECHECK_v2026.10.18.901.md) / [한국어](../findings/MONEYVERSE_ALL_FEATURE_RUNTIME_RECHECK_v2026.10.18.901.ko.md); source/raw HTTP evidence [JSON](../qa/v901-public-http-sweep.json); internal/GitHub update EN/KO.
- Version `v2026.10.18.901`, isolated `audit/full-function-recheck-v2026.10.18.901`. Candidate fixes bank request/UI fee surface, dead CTA and public announcement fetch; adds regression tests to root CI script. No actual Production/Test change and no user financial transaction; opened a **DRAFT** PR because finance and production manifest gates still fail.
- User-visible service correctness **not fully verified**: authenticated transactional member/admin E2E, 31 dynamic routes, true 5-viewport UI browser and Android device tests remain pending. Do not merge or promote until separate financial ledger/Pocket SQL fixes, certified balances, exact Test candidate and Production channel manifest and signed-in 5-pass role QA are all independently satisfied.
