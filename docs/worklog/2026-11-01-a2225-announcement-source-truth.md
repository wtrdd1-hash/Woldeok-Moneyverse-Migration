# A 22:25 — Public announcement source-truth P1 (DRAFT / HOLD)

## BEFORE — 2026-11-01 22:28 KST
- Authorized Debian 13.6 miniPC MCP direct connection; backend/frontend/Discord/Nginx/Docker/DB active.
- Fresh `origin/main` `3d5e321c3d1221febff677469fecdfcb3cf42e7d`, independent `auto/hourly-a-20261101-2225-announcement-source-truth` worktree; shared main has an unrelated dirty `implementation_plan.md` and was not modified.
- Remote branches 144 (main included), open PRs 131; overlapping announcements PRs #2380/#2377/#2362/#2359/#2347/#2272/#2243 are preserved. No code overlap in source-truth response handling was found in those PR titles; all changes require PR conflict review.
- Read AGENTS, README, English canonical and Korean living plans, QA v1446 and v1447 start. P0 #993 direct DB ACL and release identity remain HOLD. Existing Next public announcements BFF returns cached 200 empty on upstream failure.
- [x] Audit existing route and source contract; [x] isolate branch/worktree; [x] write bounded design evidence; [x] TDD RED; [x] implement source-truth contract; [x] targeted GREEN; [ ] full gates; [ ] real PG read; [ ] exact-SHA CI; [ ] official Test E2E; [ ] release authorization.

## IN PROGRESS — 2026-11-01 22:29 KST
- No migration or financial write. Reused existing PostgreSQL published-announcement SECURITY DEFINER list via ContentService. Backend public and Android-facing controllers now distinguish verified empty from unavailable with count and `sourceStatus`.
- Next BFF and Android reject missing/malformed source proof with HTTP 503, no success-shaped `[]`. Web page distinguishes unavailable from verified empty. Explicit no-store/noindex on BFF and Android.
- RED: backend 4 failed / 2 passed; frontend 6 failed. GREEN: backend 6 passed, frontend 18 passed. Evidence in isolated task directory.
- Midpoint `origin/main` rechecked unchanged `3d5e321c`; full gates and release status pending. No main merge, Test/Production deployment, DB mutation, service restart, or branch deletion.

## FINISHED — PENDING
- To be updated with exact SHA, gate evidence, release HOLD and branch preservation reasons.
