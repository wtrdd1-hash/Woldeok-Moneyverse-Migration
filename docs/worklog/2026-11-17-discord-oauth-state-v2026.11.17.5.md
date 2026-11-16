# v2026.11.17.5 — Discord OAuth state mobile login — START
- 2026-11-17 KST; owner reports screenshot error exactly matching frontend login `oauth_state`.
- Start source origin/main SHA cd822aa098d16a6f8bbfa5e41cf721eb1594e767; isolated branch fix/discord-oauth-state-v2026.11.17.5 and worktree /home/debian/Woldeok-Moneyverse-Migration/.worktrees/discord-oauth-state-v2026.11.17.5.
- Production current Nginx bridge v2026.11.17.4; previous OAuth provider-start tests passed but did not complete real provider sign-in.
- Next frontend journal contains Discord callback HTTP 400 oauth_state and HTTP 401 errors; do not log or copy OAuth state, authorization code, tokens, cookies, user identifiers, or query strings.
- Work gates: inspect integration docs and current runtime; distinguish callback cookie/host/session from challenge expiry/provider URI; reproduce with anonymous synthetic flow; red-green tests; isolated test exact source SHA; operational validation; record before/mid/end; EN/KO changelogs; PR + tests before merge.
- Safety: no production DB writes, no real financial operation, no secrets, no fabricated provider-account sign-in proof; production only with gate evidence, rollback and zero downtime.

## In progress / Root cause
- The production frontend journal shows Discord callback `oauth_state` (400), plus `401` when stale cookies are invalid.
- Production Nginx gateway sent OAuth prelogin to Spring, which sets `mv_session`, while Nest `sessionToken()` prioritizes `__Host-mv_session`.
- Fresh anonymous-only public HTTPS callback with `state` and provider-denied result correctly returned `oauth_cancelled`; a crafted, **valid** stale host cookie alongside a new Spring cookie returned `oauth_state` reproducibly. No real Discord user login or OAuth code was used.
- Kept local/register Spring auth, global Nest session priorities, and challenge binding unchanged. Scoped OAuth response changes: clear superseded host cookie at anonymous OAuth start when Spring creates a legacy session; clear superseded legacy cookie only upon real successful Nest sign-in.
- Test-first red: node:test failed to load the not-yet-created transition module.

## Midpoint 2 / Actual HTTP canary discovery
- Isolated Next server on loopback port 49117 served `/login` and `/status` 200 and completed anonymous provider-denial callback with a single session; direct `/health` was 404 because it is an edge/API health endpoint, not a Next route.
- However real Next HTTP output transformed the `Set-Cookie` empty deletion header: its `Max-Age=0` was lost, which would leave a new empty cookie and could cause a 401 on return. This was not captured by handler-only tests; production remained unchanged.
- Added a hard `Expires=Thu, 01 Jan 1970 00:00:00 GMT` to both narrowly scoped deletion cookies, with tests requiring both `Expires` and `Max-Age`. New RED 2 failures, GREEN 8/8.
- Rebuild and exact-source candidate server HTTP validation are mandatory before promotion. All other linked session flows are unaffected.
