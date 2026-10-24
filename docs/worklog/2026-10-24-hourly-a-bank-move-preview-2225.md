# A2225 — owner-scoped bank movement preview (HOLD)

## Before work
- Debian 13.6 miniPC reachable; backend, frontend, MCP, Nginx, Docker active; root disk 94% full.
- Main `49788d09494fed3e463651945b83386e87dd47bc` fetched; read AGENTS, README, English/Korean project plans and latest open PRs. Main does not include recent Draft PR work.
- Existing `/bank/movements` writes via SECURITY DEFINER, while members cannot preview exact cash/bank balances after a movement. New read-only preview must not promise settlement.
- Isolation: new worktree and `auto/hourly-a-bank-move-preview-20261024-2225`; do not touch B/C/Gemini branches or migrations. No deletes.
- Plan: write failing service/API tests, implement owner-scoped read model and guarded GET, add web preview control and Android gateway regression, then validate and record exact SHA and release HOLD.
- Initial status: IN PROGRESS. Existing global frontend test/security failures and shared dev/production DB are release blockers; never promote without official Test exact-SHA evidence.
