# C v1145 — Account all-device sign-out truth and failure recovery (HOLD)

## Before work — 2026-10-29 05:42 KST
- Debian 13.6 miniPC reached; seven services active; development PostgreSQL reachable. Shared `/` 98% full, data volume 99% full: never write shared/live DB, run backups, or modify other workers' worktrees.
- Canonical `origin/main` at `35971c600f25869c96f1c666d4b9f58927202730`. Read AGENTS.md, README.md, README/README.ko.md, English and Korean PROJECT_PLAN, active PRs, QA v1357, and A/B/C activity. All 98 open PRs are drafts. C v1144 AI-news consent, B v624 venture, A shop features do not overlap.
- Confirmed P1: `frontend/src/app/account/security/actions.ts` revokes other sessions then catches *any* current-session logout failure and still redirects to `/login?signed_out_all=1`. The user can be told all devices signed out while the current session remains active. Backend `POST /api/v1/auth/logout` revokes session and returns 204 plus a clear-session Set-Cookie; no backend or DB schema change is required to use this real contract.
- Scope: truthful completion only after backend logout and browser cookie relay, explicit partial failure recovery, reject missing cookie-clear evidence; add executable mocked-action regression and mobile/a11y/noindex checks. Do not change unrelated logout, ledger, or other worker's code.
- Plan: RED test -> GREEN implementation -> focused/full frontend, lint, typecheck, build, contract, security, isolated PostgreSQL and CI where safe -> re-fetch main -> Draft/HOLD PR if any release gate missing. Exact-SHA official Test and Production prohibited without every gate.

## In progress
- Pending test-first reproduction.

## Finished
- Pending verification; never interpret candidate image build as official Test promotion.
