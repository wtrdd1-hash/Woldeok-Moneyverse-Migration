# Development A — recent security activity category filter

## Before work (2026-10-30 12:56 KST)
- Debian 13 / miniPC direct status: backend, frontend, nginx, Docker and database connected; root 44%, DATA 47% used.
- Authority: origin/main `9da6545c4ff4809b5bd84ab6a28b9d2f1db74cef`; main checkout was one commit behind, untouched.
- Open PRs: #1983, #1985, #1986, #1987, #1990, #1991, #1992 (7). Non-main remote refs count includes historic refs; preserve all unmerged unique commits. No deletions.
- QA v1388: Production running deleted v1515 process path while symlink v1523; official Test synthetic Treasury HTTP 200; release HOLD. Previous A #1991 is shop CSV, B #1987/#1992 audit/NPS, C profile API; this feature is separate.
- Branch `auto/hourly-a-20261030-1256-security-event-category` and isolated worktree from latest main. Read AGENTS, README, English/Korean living plans, integrated master and Superpowers workflow. English canonical; Korean second language.
- Scope: P1 read-only recent security activity category filter, preserving PostgreSQL owner function, 20-event horizon, no raw metadata and no SQL migration.

## In progress
- Planned RED→GREEN Nest, web and Android regression; isolated PostgreSQL least-privilege proof; exact-SHA gates.

## Finished
- PENDING. No merge, production deployment, service restart, DB change, branch deletion or rollback authorized by this candidate.
