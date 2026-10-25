# A0652 QA — Private Active-Session Inventory CSV (2026-10-26)

**Verdict: PARTIAL / BLOCKED — Production RELEASE HOLD.** Draft PR #1383.

## Provenance, scope, and other workers
- Direct miniPC MCP system status and command at 06:52 KST: Debian 13.6; backend/frontend/bot/MCP/nginx/Docker active; database reachable. Root disk **100%** (786 MiB free at final audit), data volume 74%. Worktree isolated on data volume.
- Authoritative main SHA **1c5b84a1c45baafcca83f375a6f99698121e9bb5** checked at start, mid and pre-PR. Read AGENTS, README, EN/KO project plans and integrated planning masters; latest A QA/worklog #1381 and QA integration Draft #1317. Do not mistake unmerged planning or QA drafts for deployed source.
- Branch **auto/hourly-a-active-sessions-csv-20261026-0652**; worklog checkpoint 06e48be7, RED test checkpoint ad60a05d, code **418983ab0ea6772ef21656c80770cf49d382b890**. Start 232 remote branches / 227 open PRs; final 233 branches (232 non-main) / 229 PRs. Zero duplicate remote tip SHA, 3 conflicting PRs #1107/#1110/#1143, 174 open PRs with at least one failing check at final audit. No safe deletion candidate proven, **0 branches deleted**. Preserve all unique/unfetched branches and other workers.
- No modification to applied migrations, WLD ledger, Production-linked database or other worktrees. No service restart.

## End-to-end user feature
- On /account/security, signed-in members can explicitly download the **current active-session inventory** as CSV; this is NOT historical login activity. Link is keyboard-sized, no prefetch, omitted if the authoritative session list failed to load. Private page is force-dynamic and noindex.
- Nest GET /api/v1/account/security/sessions/export inherits Session/Authenticated/Consent guards. The user UUID and current session ID are derived exclusively from verified server session; no client-selected actor. Existing PostgreSQL SECURITY DEFINER account_active_sessions(user,current) is queried with LIMIT 101; **more than 100 sessions returns 409**, never a silently partial 200.
- Backend JSON exposes only createdAt, lastSeenAt, expiresAt, deviceLabel, current and administratorSession. No session IDs, tokens, IPs, user-agent, CSRF values, or raw metadata. PostgreSQL function itself accepts supplied UUIDs and does not independently authenticate a DB caller; backend guards are the critical actor identity boundary.
- Next same-origin /account/security/sessions.csv strictly validates all data, complete flag, cap and canonical UTC times; CSV formula/control-character escaping and UTF-8 BOM; returns 503 on invalid/incomplete/unavailable data, forwards 401/403/428 refusal. Success and errors private/no-store/noindex/nosniff.
- Android /app-api/v1/account/security/sessions/export forwards secure session cookie, preserves error status, forces no-store/noindex even if upstream omits headers. Generated EN/KO mobile API references now cover **180 endpoints**. No new DB migration or financial write.

## Test evidence (code SHA 418983ab)
- RED: backend 3 tests fail due to missing methods, frontend 2 test files fail due to missing serializer/route. GREEN: backend export 4 PASS + existing security repository 4 PASS; frontend serializer 3 PASS + BFF route 2 PASS + UI a11y/SEO 2 PASS + Android gateway 12 PASS (2 new).
- Typecheck **PASS**; lint **PASS** after correcting one introduced test lint error (0 errors, baseline 1,128 warnings plus potential test-warning drift); backend and frontend builds **PASS**, including Next dynamic CSV route; generated API contract check **PASS** (180 endpoints / 639 controller methods).
- Full backend **1,316 PASS / 398 SKIPPED**. Full frontend **1,404 PASS / 6 FAIL**: SEO/i18n 3, login touch target 1, calculator registration link 1, admin M2 1; baseline failures already present in earlier A and QA. Database package **15 PASS / 3 SKIPPED**; contract **38 PASS**; Discord bot **8 PASS** after providing existing dependency symlink (initial missing module was setup failure).
- Security audits **FAIL**: prod 2 HIGH; full 2 CRITICAL / 10 HIGH / 11 MODERATE / 3 LOW; bot npm audit 1 CRITICAL / 5 HIGH. No suppression or false PASS.
- Isolated real PostgreSQL 17.11 **wdmv_v761_test_acl**, 281 applied migrations. READ ONLY transaction with effective role moneyverse_app: active session function EXECUTE allowed, 2 owner rows returned, auth_security_events direct SELECT denied, ledger_postings INSERT denied; ROLLBACK. No fixtures or Production writes. Cross-account authenticated web E2E not proven; DB function filters by caller-supplied actor and must not be described as independent identity proof.

## CI, Test, Production, rollback
- Draft PR #1383 candidate CI in progress when first audited; do not interpret a running job as PASS. Final exact docs SHA and CI status to be posted in PR comment.
- Official Test /api/version = **6f697e74b7bf0cd1e4521d36534cfd9c140f8010**, Production /api/version = **6a989b5ac0c6155587d43426d64f6def6b62c917**; neither equals candidate. Exact-SHA authenticated Test web/Android E2E, isolated restore, full security and release gates NOT PASS.
- P0 blockers remain: root disk 100%, production/dev database 5433 exposure and separation, excess app-role DML/PUBLIC bank function grants per QA, migration 266 provenance, frontend regression and security audit failures.
- **No main merge, Test or Production promotion, DB migration, financial write, service restart, GitOps change or branch deletion.** Rollback now is to leave Draft #1383 unmerged. A future reviewed release can revert the read-only route/link/contract changes if needed. Production RELEASE HOLD.
