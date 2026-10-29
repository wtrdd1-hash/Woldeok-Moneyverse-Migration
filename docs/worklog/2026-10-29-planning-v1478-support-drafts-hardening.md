# v1478 — Owner-private support drafts: verified send and ACL hardening (2026-10-29)

**Status:** IN PROGRESS / DOCUMENTATION ONLY / RELEASE HOLD. **Cycle:** Previous Feature Addition v1476 → Current Feature Improvement v1478 → Next Feature Addition v1480 (provisional).

**Authority:** main `54b182d2214a15974350701174175f589789613b` at start; v1476 predecessor Draft PR #1901, not merged and currently conflicting. Read `AGENTS.md`, `README.md`, English canonical `docs/planning/PROJECT_PLAN.md`, Korean counterpart and both integrated masters. Superpowers `using-superpowers`, `brainstorming`, `using-git-worktrees`, `writing-plans`, `verification-before-completion` consulted; `skills__list` returned no URIs, so installed repository skills were read on miniPC.

**Read-only evidence:** DEV PostgreSQL 17.11 has 3 support threads, 6 messages, no draft table. Contrary to SQL migration 196 and 302 REVOKE statements, `moneyverse_app` currently has direct SELECT/INSERT/UPDATE/DELETE/TRUNCATE on both support tables (confirmed via `information_schema.role_table_grants`); Production ACL and abuse are not verified. Existing Next support server actions generate fresh `randomUUID()` on each send attempt, and `support_create_thread` replays same key without checking subject/body equality; an uncertain response therefore cannot be safely retried without additional contract. QA v1374 Draft #1902 is FAILED/HOLD, not a release certificate.

## Checklist
- [x] Read installed skills, inspect main, open PRs, actual support frontend/backend/SQL and DEV database (read-only).
- [x] Isolate new v1478 worktree and preserve v1476 predecessor.
- [ ] Record P0 support table ACL drift and owner-safe send replay backlog on GitHub.
- [ ] Strengthen English/Korean integrated master and canonical project plan, without new standalone planning specs.
- [ ] Recheck main and planning docs mid-run, verify bilingual backlog parity, run document classification and diff checks.
- [ ] Commit/push, create Draft PR stacked on v1476, record GitHub and final status.

**Hard gates:** no runtime code, SQL, finance balances, DEV writes, Test or Production changes; feature OFF; independently deduplicated external references newly approved 0, cumulative UNKNOWN/10,000 (BLOCKED / IN PROGRESS).
