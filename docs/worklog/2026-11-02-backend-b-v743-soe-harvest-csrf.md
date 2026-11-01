# Backend B v743 — SOE dividend harvest CSRF enforcement

## Before work — 2026-11-02 05:36 KST
- Baseline origin/main: a8541927c3a351d980454c66e95a3356c47e0722; branch: auto/hourly-b-v743-soe-harvest-csrf-20261102-0536.
- Read AGENTS.md, README.md, English and Korean project plans, QA v1455, open PRs, latest CI, and related enterprise code.
- P1: POST /api/v1/admin/enterprises/soes/harvest has admin console session guard but lacks CSRF unlike the neighboring SOE governance write.
- Source: EnterpriseService.harvestSoeDividends already returns 503 (no certified ledger settlement). This change must not enable a dividend payout.
- Plan: RED HTTP regression for absent/invalid CSRF, valid session-bound CSRF still returns 503, admin GET unchanged; add route guard; GREEN; run repository gates; no merge/deploy without exact-SHA Test and complete CI.

## In progress
- [x] RED HTTP regression: 3 failures of 5 tests; missing and invalid CSRF reached the 503 service instead of returning 403.
- [x] Minimal route guard: @UseGuards(CsrfGuard) on SOE dividend harvest; no SQL/ledger/API shape changes.
- [ ] GREEN and project gates: focused HTTP 5/5 PASS; full gates pending.
- [ ] Recheck main and release HOLD

## Finished
- Pending.
