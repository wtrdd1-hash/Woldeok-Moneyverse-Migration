# v2026.11.17.12 — Spring signed-in session database ACL repair
## BEFORE — 2026-11-17 09:16 KST
Owner requests full repair and Production promotion. Main advanced during this task: PR #3221 merged at 381c749ba0; latest main refreshed and new independent worktree created.
Official Test PostgreSQL wdmv_v761_test_acl_v1544_restore as moneyverse_app: auth_sessions SELECT true, users SELECT false, user_roles SELECT false, admin_roles table missing. DB-owned admin_current_roles(uuid) and admin_session_touch(uuid,uuid) functions exist. Existing Spring UserAuthService.resolveSession LEFT JOIN users and findUserRoles direct table reads cannot validate actual admin sessions; only anonymous negatives passed. Test read-only canary of prior exact PR SHA f99f25bec... on :3154 connected to official Test DB and returned health 200, unauthenticated 401.
Parallel SEC1 worktree modifies UserAuthService independently. Do not overwrite or merge its uncommitted work; prepare an independent branch for review and integration, and do not claim actual Production functionality without positive E2E.
## MID — 2026-11-17 09:17–09:20 KST
- Main unchanged after 381c749ba0 refresh. Official Test DB schema checked via the live test-main-backend app role: auth_sessions SELECT true; users and user_roles SELECT false; admin_roles absent; admin_current_roles and admin_session_touch present and accessible. Valid auth_sessions columns match minimal query.
- TDD regression tests RED 2/3: deny direct users JOIN, deny user_roles/admin_roles direct reads; source allowed fake non-admin fallback or no session.
- Same UserAuthService change already exists uncommitted in peer SEC1 worktree. Applied only its diff into our isolated tree for independent validation; peer files were not changed. No duplicate competing edits made to peer branch.
- TDD GREEN targeted 3/3. Full Spring clean test bootJar 129 passed, 0 failed, 0 skipped; immutable Test candidate pending.

## FINISHED
Pending.
