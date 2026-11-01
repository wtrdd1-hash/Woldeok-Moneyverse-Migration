# Development C v1256 — FX source truth

## START (2026-11-01 10:40 KST)
- Host: Debian 13.6 miniPC debian13, 7/7 services active, development PostgreSQL connected; no production mutation.
- Main origin SHA: f13bbce273ffc65e8576170992d82ea00c27a1c9.
- Branch: auto/hourly-c-fx-source-hold-v1256-20261101-1040; isolated worktree under /srv/moneyverse-data/tasks.
- Reviewed AGENTS.md, README.md, README/README.ko.md, English/Korean canonical planning, open PRs including C #2295, A #2293, B #2294 and QA #2271. No overlapping FX PR identified.
- P0 source evidence: Nest GET /api/v1/fx/portal and forward/rates deliberately 503; FX financial writers deliberately 503; frontend/fx/page.tsx still uses synthetic 1352.5 and shows trade controls; FX metadata claims official live service.
- Plan: docs/superpowers/plans/2026-11-01-fx-source-truth-v1256.md.
- State: IN PROGRESS. RED tests, source gate, SEO correction, regression and exact-SHA gates pending.
- Production, Test, main and other task worktrees remain untouched.
