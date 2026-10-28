# C v1117 — FX administrator evidence and unsafe-control hold

## Before work — 2026-10-28 09:12 KST
- Source: origin/main b323647636a3f594c67ca7c95b039d86882530b4. Independent branch auto/hourly-c-fx-console-evidence-v1117-20261028-0845; original worktrees untouched.
- Read AGENTS.md, README.md, README/README.ko.md, both PROJECT_PLAN variants, active PRs, A/B/C/QA changes and latest CI.
- P1 reproduced by source inspection: FX page hands the Nest response envelope to a data-only component; browser fetches /api/v1/admin/fx/* without a Next handler, and fallback values invent live reserves, exchange rates, FSI, and bilateral facilities.
- Backend FX repository still issues direct SQL on FX tables (migration 255 does not grant app role access), and unjournaled write paths are not approved. Do not enable dangerous financial controls.

## In progress
- [x] RED: absent evidence parser caused 1 failing suite; 1,844 pre-existing tests passed. GREEN: 9 focused parser/SSR tests pass.
- [x] Verify NestJS response envelope, UUID/code IDs, numeric safety, 24h freshness, explicit unknown state; remove unsupported browser-to-Nest mutations and disable financial controls.
- [ ] Run broad, security, CI and release gates. Isolated PostgreSQL 17 migration 255 confirms app role SELECT is denied (42501); backend read-model migration must be separately coordinated with existing PR #1658 (which reserves migration 288-290).

## Midpoint — 2026-10-28 09:17 KST
- Main advanced b3236476 -> 7357d9d4 (release routing documentation only; FX and plan unchanged).
- Existing PR #1352 addresses public FX, not administrator console. Existing PR #1658 reserves migration 288-290, so do not collide.

## Finished
- PENDING.
