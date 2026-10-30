# Planning v1500 — Wallet Calendar Range (F675-181)

**Status: IN PROGRESS / DRAFT / RELEASE HOLD**. Previous Feature Improvement v1498 → Current Feature Addition v1500 → Next Feature Improvement v1502 (provisional).

## Before work (2026-10-30 10:03 KST)
- Authoritative origin/main `a7f8730b9838b9324b6ece25e394dfcc8709aadf`; read AGENTS.md, README.md, canonical PROJECT_PLAN.md and Korean parity, integrated masters, source and QA v1385 evidence.
- Scope: documentation-only owner-private KST calendar date range for existing wallet activity; not a saved filter, monthly summary, export or ledger mutation.
- Skills: `skills__list` returned no available URI; miniPC installed Superpowers using-superpowers, brainstorming, writing-plans, using-git-worktrees, verification-before-completion read. Design remains a proposal; no code implementation authorization.
- P0 reality: QA v1385 Docker-volume/workspace provenance issue #1968, DEV ACL issue #993, Treasury Test issue #1917, finance test missing `undici`, 3 lint errors, generated mobile API drift. Root/data currently 42%/37%; restored space is not proof of safe recovery.

## In progress
- [x] Inspect latest main, open PRs, actual wallet frontend/backend and QA evidence.
- [x] Recheck main mid-run and reconcile source/QA changes.
- [x] Add full EN/KO design to existing integrated planning masters and concise canonical project plans.
- [x] Refresh P0/P1 10-item handoff, EN/KO changelogs and internal/GitHub updates.
- [x] Verify documentation parity and diff; GitHub CI final status remains pending; runtime, DB and Production unchanged.

## Finished
**Documentation stage complete / DRAFT / RELEASE HOLD (2026-10-30 KST).** Fresh verification: release classifier 22 PASS / 0 FAIL; 12 docs-only changed files; EN/KO each contain exactly 4 P0 + 6 P1 IDs; git diff --check PASS; working tree clean after push. First parity probe failed because the compact project summary abbreviated RANGE IDs; fixed both languages and reran successfully. QA v1385 finance suite collection missing undici, lint 3 errors, mobile contract drift and recovery provenance remain BLOCKED. Final GitHub CI not yet certified (checks pending on last observation); no merge, runtime, DB, WLD, Test or Production change. External approved 0 new, cumulative UNKNOWN / 10,000. Next Feature Improvement v1502 (provisional).
