# Runtime API 5xx Hotfix Worklog — v2026.10.03.516

- Status: STARTED
- Date: 2026-10-03 KST
- Branch: `fix/runtime-api-5xx-v2026.10.03.516`
- Start `origin/main`: `6fc3adc20bf21c7a447c4693fa07625da014f336`
- Scope: diagnose and remediate repeated HTTP 500 on `/app-api/v1/chat/conversations` and HTTP 503 on `/api/activity/events`; verify exact candidate on Test before any Production promotion.
- Runtime evidence at start: Production backend/frontend/Nginx active; public `/` and `/health` HTTP 200; recent 5xx concentrated on the two routes above.
- Safety: no Production mutation before Test verification; preserve session continuity; use isolated worktree to avoid concurrent-agent conflicts.
- Security follow-up: investigate URL query-string API-key exposure observed in access logs and ensure secrets are not logged in URLs.
