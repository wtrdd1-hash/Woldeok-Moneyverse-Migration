# C v1116 — Content Desk Read Evidence (canonical EN)

## START — 2026-10-28 08:45 KST
- Baseline: `b1cd54fda1123fb07ca81b6e5b3ead70f59f556c` (`origin/main`), isolated `auto/hourly-c-content-desk-evidence-v1116-20261028-0845`.
- MiniPC Debian 13.6: 7/7 services active; development PostgreSQL connected. **Do not touch shared/live database.**
- Read AGENTS.md, README.md, README/README.ko.md, PROJECT_PLAN.md/.ko.md, latest open A/B/C/QA PRs and CI.
- Evidence: `frontend/src/app/admin/content/page.tsx` maps three failed `apiOrNull` reads to empty arrays, falsely claiming no pending photo reviews or no content. Runtime shapes not validated; destructive management actions could be offered for malformed identities.
- Backend contracts: authenticated `GET /api/v1/admin/photos/submissions` (limit 50), `/api/v1/admin/photos` (limit 100), `/api/v1/admin/announcements` (array). Existing NestJS guards and PostgreSQL functions are authoritative. No schema change.
- Goal: fail closed for malformed/unavailable feeds, distinguish verified empty from failed read, avoid pretending bounded photo lists are exhaustive, preserve admin authentication, responsive accessibility, and noindex.
- Avoid overlap with A/B/QA and other C PRs; no main writes or Production deploy.

## Plan
- [ ] Add red tests for failed/malformed/valid feed evidence and SSR.
- [ ] Implement runtime validation and per-section failure alerts, retry navigation, and safe omission of unverified management actions.
- [ ] Add bounded-list disclosure, no fabricated completeness claims; verify full gates and isolated database where feasible.
- [ ] Refresh main/plan hashes, publish Draft PR, record HEAD exact-SHA and release HOLD.
