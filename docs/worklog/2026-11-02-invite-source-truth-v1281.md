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
