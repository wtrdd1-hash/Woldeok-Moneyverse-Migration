# Development C v1239 — Authenticated page privacy headers

## BEFORE WORK — 2026-11-01 00:15 KST
- Canonical origin/main: `353c6d5d6ddbc14b1067e84f9c4a127bab1c3834`; isolated `auto/hourly-c-private-route-headers-v1239-20261101-0015` worktree.
- Debian 13.6 miniPC: seven core services active, development PostgreSQL connected. Existing main checkout has untracked files; not touched.
- Read AGENTS.md, README.md, README/README.ko.md, English and Korean living plans; inspected active Draft PRs #2216–#2224, QA v1423, Backend B v701, C v1236–v1238. No active PR owns the common authenticated page header policy.
- P1 observed: Next global `X-Robots-Tag: index, follow` applies to authenticated routes; the only specific override is derivatives. QA v1423 independently observed Production login/wallet/admin advertising index,follow. Page metadata robots alone is insufficient at HTTP edge. Existing issue #2012.
- Scope: deterministic per-path noindex/nofollow, private/no-store and no-referrer for protected HTML paths, including localized aliases, without changing public SEO, auth, API, DB or ledger. Not a release approval.

## PLAN / CHECKLIST
- [ ] TDD RED: assert protected route patterns and unchanged public indexability.
- [ ] GREEN: add path-specific HTTP header rules after global defaults.
- [ ] Verify focused regression and independent HTTP response, then full HEAD gates where resources permit.
- [ ] Re-fetch origin/main/plans, record exact SHA, remote CI, Test/Production, backups, and release HOLD.

## IN PROGRESS
- Test-first implementation pending.

## FINISHED
- Pending.
