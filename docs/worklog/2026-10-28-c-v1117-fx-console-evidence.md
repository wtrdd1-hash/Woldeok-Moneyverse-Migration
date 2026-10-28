# C v1117 — FX administrator evidence and unsafe-control hold

## Before work — 2026-10-28 09:12 KST
- Source: origin/main b323647636a3f594c67ca7c95b039d86882530b4. Independent branch auto/hourly-c-fx-console-evidence-v1117-20261028-0845; original worktrees untouched.
- Read AGENTS.md, README.md, README/README.ko.md, both PROJECT_PLAN variants, active PRs, A/B/C/QA changes and latest CI.
- P1 reproduced by source inspection: FX page hands the Nest response envelope to a data-only component; browser fetches /api/v1/admin/fx/* without a Next handler, and fallback values invent live reserves, exchange rates, FSI, and bilateral facilities.
- Backend FX repository still issues direct SQL on FX tables (migration 255 does not grant app role access), and unjournaled write paths are not approved. Do not enable dangerous financial controls.

## In progress
- [ ] Write regression tests first and record RED.
- [ ] Verify strict read response and explicit unknown state; keep unsupported financial mutations unavailable.
- [ ] Run focused, broad, security, PostgreSQL, CI gates; refresh main mid-run.

## Finished
- PENDING.
