# Development A — 2026-10-25 19:55 KST — Verified Casino History Export

## BEFORE WORK
- Debian 13.6 miniPC and backend/frontend/nginx/docker ACTIVE. Root 98% used, data disk 61% used. Worktree isolated on data disk.
- Main: 1c5b84a1c45baafcca83f375a6f99698121e9bb5. AGENTS/README, English+Korean project plans and integrated master, recent QA #1317 and A #1320 reviewed.
- Remote branch refs before: 182 total (181 non-main); all 181 have unique unmerged commits. Open PRs: 178. Conflicts: #1107, #1110, #1143. No deletions permitted.
- Latest QA #1317 reports 1404/1404 frontend pass and prod audit pass on its **unmerged** draft; baseline main retains known 6 frontend failures and dependency vulnerabilities. Do not claim draft fixes on main.
- Candidate feature: bounded owner-only coin/dice history CSV (P1), not overlapping B stock, C quest or QA frontend repair.

## IN PROGRESS
- [x] System status, main and policy, QA/PR/branch/CI review.
- [x] New branch/worktree and implementation plan.
- [ ] RED/GREEN backend, web and Android tests.
- [ ] Real isolated PostgreSQL read-only ACL and rollback.
- [ ] Full gates and exact SHA CI.

## FINISHED
- Pending. Production RELEASE HOLD; no DB migration, writes, deployment, branch cleanup or restart.
