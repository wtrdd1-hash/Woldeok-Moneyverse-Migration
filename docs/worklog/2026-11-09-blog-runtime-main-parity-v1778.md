# v2026.11.09.1778 — Blog production/runtime vs GitHub main audit

## Before work — 2026-11-09 KST
- Owner requested a fresh inspection and comparison of the actual miniPC blog implementation against GitHub `main`, with corrective action where supported.
- Priority read: `AGENTS.md`, `docs/DOCUMENTATION_POLICY.md`, `docs/planning/PROJECT_PLAN.md`, `docs/planning/INTEGRATED_PLANNING_MASTER.md`, `DOCS_INDEX.md`, v1405 2-hour blog specification, and v1625 blog runtime worklog. The planning authority predates many later runtime releases; runtime facts require fresh evidence.
- Local web checkout and fetched `origin/main` are **b2980de529eaea505f1387d2bd05e45b7c1c064a**. Existing main worktree has another agent's `implementation_plan.md` edit; leave untouched. This task uses isolated `fix/blog-runtime-audit-20261109-v1778` worktree.
- Read-only host inspection: v1777 backend/frontend systemd services active. Legacy v1419 blog publisher's last attempts on 2026-11-09 failed (`ARTICLE_QUALITY_HOLD:NUMERICAL_CLAIMS_NEED_INDEPENDENT_PROOF`, then timeout). Legacy v1419 timer disabled; legacy v1625 blog frontend unit failed. These facts do not by themselves prove current public-route failure; current Nginx and HTTP probes are pending.
- No database writes, user money changes, deployment, restart, scheduler enable, or article status changes authorized by this checkpoint.

## In progress
- [ ] Map actual Nginx upstreams, current live backend/Next app identities, and publication job scheduling.
- [ ] Probe public/localhost blog hubs, article pages, verified API, sitemap, canonical, robots, and ads.
- [ ] Compare code and runtime artifacts to current `origin/main`; inspect the Android application's separate repository.
- [ ] Root-cause confirmed failures, add regression test before any focused source correction, validate in isolated environment.
- [ ] Recheck main and avoid concurrent agent changes; record source CI, Test, Production, and release state accurately.

## Finished
- PENDING.
