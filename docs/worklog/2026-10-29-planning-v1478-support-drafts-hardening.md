# v1478 — Owner-private support drafts: verified send and ACL hardening (2026-10-29)

**Status:** IN PROGRESS / DOCUMENTATION ONLY / RELEASE HOLD. **Cycle:** Previous Feature Addition v1476 → Current Feature Improvement v1478 → Next Feature Addition v1480 (provisional).

**Authority:** main `54b182d2214a15974350701174175f589789613b` at start; v1476 predecessor Draft PR #1901, not merged and currently conflicting. Read `AGENTS.md`, `README.md`, English canonical `docs/planning/PROJECT_PLAN.md`, Korean counterpart and both integrated masters. Superpowers `using-superpowers`, `brainstorming`, `using-git-worktrees`, `writing-plans`, `verification-before-completion` consulted; `skills__list` returned no URIs, so installed repository skills were read on miniPC.

**Read-only evidence:** DEV PostgreSQL 17.11 has 3 support threads, 6 messages, no draft table. Contrary to SQL migration 196 and 302 REVOKE statements, `moneyverse_app` currently has direct SELECT/INSERT/UPDATE/DELETE/TRUNCATE on both support tables (confirmed via `information_schema.role_table_grants`); Production ACL and abuse are not verified. Existing Next support server actions generate fresh `randomUUID()` on each send attempt, and `support_create_thread` replays same key without checking subject/body equality; an uncertain response therefore cannot be safely retried without additional contract. QA v1374 Draft #1902 is FAILED/HOLD, not a release certificate.

## Checklist
- [x] Read installed skills, inspect main, open PRs, actual support frontend/backend/SQL and DEV database (read-only).
- [x] Isolate new v1478 worktree and preserve v1476 predecessor.
- [x] Record P0 support table ACL drift in issue #1908; identify existing #1456/#1758 overlap and v1476 #1900 for owner-safe send replay backlog.
- [x] Strengthen English/Korean integrated master and canonical project plan, without new standalone planning specs.
- [x] Recheck main and planning docs mid-run, verify bilingual backlog parity, run document classification and diff checks.
- [ ] Commit/push, create Draft PR stacked on v1476, record GitHub and final status.

**Hard gates:** no runtime code, SQL, finance balances, DEV writes, Test or Production changes; feature OFF; independently deduplicated external references newly approved 0, cumulative UNKNOWN/10,000 (BLOCKED / IN PROGRESS).

**Mid-run:** main unchanged at `54b182d2214a15974350701174175f589789613b` (23:08 KST), canonical project plan blob `57a36addf80c22f80fb0546b1980fc2e7f230d82`, integrated master blob `88046593f56723665e87df20eebf3db442c0aa3a`. P0 issue #1908 OPEN. QA v1374 Draft #1902 not merged. Three overlapping drafts F675-139/#1456, F675-164/#1758 and F675-175/#1900 reconciled into one proposed implementation; 7 vs 30 days still awaiting decision.

**Local verification:** `node --test scripts/release/classify-release.test.mjs`: 17 PASS / 0 FAIL; four bilingual planning documents each contain exactly the same 10 v1478 backlog IDs; `git diff --check` PASS; all changes under docs/. Synthetic PG/security tests NOT RUN. GitHub issue #1900 and overlap issues #1456/#1758 commented, P0 #1908 OPEN.
