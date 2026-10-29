# Development B v606 start — 2026-10-28 11:40 KST
- Starting main: a28bed9aa40ff74d492824ae12892a7d52132fdd
- Worktree: /srv/moneyverse-data/build-workspaces/mv-b-v606-20261028-1135
- Branch: auto/hourly-b-blog-visibility-acl-v606-20261028-1135
- P1 QA #1661: direct SELECT leaks withdrawn/deleted verified blog bodies.
- Scope: forward-only SQL visibility functions and backend repository contract, no existing migration rewrite, no live DB access.
- Dependency: migration 291 reserved by unmerged PR #1664; use 292 and keep release blocked until gap resolved.
- Before work: AGENTS, README, EN/KO plans, QA v1339, open PRs and CI inspected.

## In progress — 2026-10-28 11:42 KST
- RED: database 3/3 and repository 2/2 tests failed before implementation.
- Added forward-only v292 functions, revoked unrestricted app SELECT, switched repository to scoped SQL.
- Migration 291 remains a dependency of unmerged #1664; no applied migration modified.

## Verification checkpoint — 2026-10-28 11:47 KST
- Changed API implementation: repository `list` and `find` use public-only `SECURITY DEFINER` SQL functions; `currentPeriod` and `digests` use bounded metadata-only functions. HTTP paths and JSON shape unchanged.
- Database v292: removes direct article table SELECT for PUBLIC and `moneyverse_app`, grants EXECUTE on four narrowly scoped functions, keeps existing v288-v290 bytes immutable. No ledger, account balance or production DB mutation.
- RED->GREEN: 3 database policy tests + 2 repository tests initially failed; all five passed after implementation.
- Isolated PostgreSQL 17 (network=none, ephemeral container): baseline v288 SELECT privilege reproduced, v292 revoked direct access; withdrawn/deleted bodies invisible to public functions; published lookup works; scheduler receipt/digest metadata retained; withdrawal visibility retested. PASS, container removed.
- Database full: 47 PASS, 3 SKIPPED, 1 FAIL (migration 291 gap because unmerged #1664 owns 291). With the exact 291 SQL temporarily read from #1664, six migration parity tests PASS. The temporary file was removed and #1664 was not changed.
- Backend: 1,929 PASS, 440 SKIPPED. Typecheck PASS after contract build. API contract 180 endpoints PASS.
- Frontend: 1,864 PASS, 1 FAIL (pre-existing admin-blog-client.test.tsx expects obsolete Korean review-hold copy). This failure is unrelated to the new SQL read functions and is not waived.
- Full Lint PASS (0 errors, 1,102 warnings). Full build PASS. Discord Bot 11 PASS after isolated dependency install.
- Root dependency audit FAIL: 12 findings (3 low, 9 moderate), including qs advisory. No dependency gate waiver.
- Official Test exact-SHA, authenticated API/login/admin E2E, full-schema PostgreSQL ACL and GitOps release approval NOT VERIFIED. Production strictly HOLD.
- Residual security scope: existing admin moderation actor UUID is caller supplied and must be separately audited for DB-level identity spoofing. Metadata-only scheduler functions remain callable by app role; no article bodies are exposed by them.

## Finished implementation / release state
- New branch from authoritative main. No existing applied migration edited. No changes to other developer branches or worktrees.
- PR must remain Draft + hold; migration 291 dependency, failing full tests and security audit prohibit merge or deployment.
- No Test or Production deployment. No branch cleanup.
