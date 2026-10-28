# C v1120 audit export safety plan

1. RED: unit tests for Excel formula injection and exact current-page export scope.
2. GREEN: pure CSV serializer preserving raw audit evidence while neutralizing formula-like cells, wire existing UI and accessible scope labels.
3. Verify focused, frontend, backend, build, lint, typecheck, real isolated PostgreSQL, security, app-api, E2E and required GitHub CI on exact HEAD.
4. Re-fetch main and planning; no merge or deployment until all gates PASS. Protect other worktrees.
