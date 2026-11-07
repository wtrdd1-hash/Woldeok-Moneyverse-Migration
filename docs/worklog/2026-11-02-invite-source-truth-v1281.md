# C v1281 — Invitation landing truth / release hold

## Start (2026-11-02 02:46 KST)
- miniPC Debian 13.6, all seven services active, development PostgreSQL connected. Repository base origin/main `510dbe6bf4d5c2a8089fc06b480776053da7a2e3`; original main checkout contains an unrelated modified `implementation_plan.md` and must not be changed.
- Inspected AGENTS.md, README.md, README/README.ko.md, both living plans, latest GitHub PRs/CI and concurrent A/B/C/QA planning. Existing open PRs do not address invitation landing. Isolated worktree and branch `auto/hourly-c-invite-source-hold-v1281-20261102-0245`.
- Verified defect: `/invite/[code]` claims code authenticated, 10,000,000 WLD paid and five potions with no referral API, ledger receipt or registration binding; its `/auth/login?invite=...` target is not the actual login route. This is a P0 false-financial-promise and misleading signup path.
- Scope: fail closed until a server-backed invitation verification and ledger reward receipt exist. Preserve working /register and /login links without propagating unverified code. No database or money writes. Mobile, accessible, noindex. Test-first and independent CI gates. Never merge/deploy on incomplete gates.

## Mid-run implementation and evidence (2026-11-02 02:49 KST)
- RED: 2/2 Vitest SSR/metadata tests failed against original page (no robots directive; fabricated code authentication/reward and broken `/auth/login` link).
- GREEN: 2/2 passed after replacing the page with an unverified, accessible invitation notice; no token echo, payout amount, false reward CTA, or redirect. Real `/register` and `/login` destinations only.
- `backend/src` and `packages/database/migrations` contain no invitation verification/claim contract; `frontend/src/app/register/actions.ts` has no referral binding. Do not fabricate an API or reward receipt. This is a protective fail-closed UI behavior, not completed referral issuance.
- Re-fetched origin/main mid-run: still `510dbe6bf4d5c2a8089fc06b480776053da7a2e3`. A/B/QA/planning drafts left untouched. No main, Test or Production writes.

## Release policy
- No PR merge or production promotion without all exact-HEAD checks, isolated real-PostgreSQL, authenticated browser E2E, required CI, and official Test evidence. Record blocked gates explicitly.

## Verification and correction (2026-11-02 03:01 KST)
- On candidate `083a381c7c3325fce55eb10b4cf1f4e095c207a5`: lint 0 errors/1,026 warnings; typecheck PASS after isolated worktree dependency symlinks; frontend build PASS with 2 GiB heap after 1 GiB OOM; backend build PASS; frontend full suite 2,924 PASS; backend 2,978 PASS, 2 FAIL, 518 SKIP (unrelated profile HTTP test expects 200 but receives 401); database package 62 PASS, 5 SKIP; app-api contract 184 endpoints PASS; full route QA FAIL missing `artifacts/qa/full-route-ledger.json`; dependency audit FAIL 9 (1 low, 8 moderate).
- Disposable PostgreSQL 17.11 applied 322/322 migrations successfully after waiting for post-init server startup; verified `moneyverse_app` has no INSERT on ledger_transactions; ephemeral container deleted. No shared database touched.
- Independent Next HTTP test initially found `200` and `<meta name="robots" content="noindex, nofollow">`, but **HTTP `X-Robots-Tag` was `index, follow`** and `Referrer-Policy` allowed cross-origin origin disclosure. Also, Next Flight serialized the route parameter even though the rendered UI did not display it. This requires HTTP protection, not only page metadata.
- Added route-specific noindex, no-referrer, private no-store headers to `frontend/next.config.ts`; a new header-policy test failed before the fix and passed afterward (11/11 focused tests). Related broader private-header Draft #2225 remains untouched and must be considered before merge.
- All above measurements precede the final follow-up commit; rerun mandatory gates on its exact HEAD before release decisions.
