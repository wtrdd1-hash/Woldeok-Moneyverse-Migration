# Planning v1416 — Optional notification category preferences (Feature Addition)

**Status:** STARTED / DRAFT / RELEASE HOLD. Previous Feature Improvement v1414 → Current Feature Addition v1416 → Next Feature Improvement v1418 (provisional).

## Before work — 2026-10-28 16:08 KST
- Canonical main `d12c948ac454b0762cfb7fb0cddf83703a775172`; read `AGENTS.md`, `README.md`, English `docs/planning/PROJECT_PLAN.md`, Korean mirror, actual Next notification UI/actions, NestJS notification service/controller/DTO, migration 081/082 engagement preference, GitHub open PRs, and QA v1343 read-only evidence.
- Main has only a **single** `member_engagement_preferences.notifications_enabled` boolean for goals/NPC; it does **not** provide optional per-category delivery controls. Existing notification inbox has seven visible categories but the underlying producer/event classification and table DDL provenance need validation. Proposed new F675-160 is not deployed.
- Critical unrelated release holds: data volume 96% used; QA v1343 observed 18 USER_CASH credits totaling 18,000 WLD without corresponding canonical dividend postings and canonical treasury 0 WLD; QA/finance #1706 owns remediation. No production finance changes permitted.
- `skills__list` returned no URIs; local `using-superpowers`, `brainstorming`, `writing-plans`, `using-git-worktrees`, `verification-before-completion` inspected. Separate main-based branch/worktree; no other branches changed.

## Checklist
- [x] Inspect latest main, QA, PRs and actual API/DB/frontend constraints.
- [ ] Specify purpose, protected categories, API, SQL, transactions, administrator controls, abuse prevention, mobile/SEO/a11y/KPIs, tests and rollback in integrated English/Korean plans.
- [ ] Update P0/P1 backlog, bilingual plans, changelogs and GitHub issue/PR.
- [ ] Recheck main mid-run and run documentation parity/branch verification.
- [ ] Record completion and unresolved release gates; no runtime deployment.

## In progress / Finished
Pending further evidence and documentation-only work.
