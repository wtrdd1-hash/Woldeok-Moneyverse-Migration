# v2026.11.17.2 — Admin runtime log dashboard: Production promotion attempt

**State: BEFORE WORK / operator-requested production promotion, 2026-11-17 KST.**

## Authorization and isolation
- Owner explicitly requested Production promotion after the v2026.11.17.1 isolated implementation review.
- Source: task branch `fix/admin-system-logs-hardening-v2026.11.17.1`, PR #3205, source SHA `b6d013ee06b49c30905115bea7a4092fd4ab0957`; fetched `origin/main` `86777fb2d5a1f8bbc680453368c0a5f04b5c7715` before work.
- Reviewed canonical integrated planning master, `AGENTS.md`, Spring runtime observability skill and `docs/RELEASING.md` plus live systemd/Nginx topology. Existing Gemini/other worktrees not touched.

## Required gates
- [ ] Exact candidate CI succeeds; integrate only verified code to current main.
- [ ] Rebuild immutable SHA-identical backend and frontend with genuine backend/frontend identity.
- [ ] Restore genuinely isolated official Test, verify Test DB routing (not Production) and exact SHA through public URLs.
- [ ] Verify authenticated superadmin actual HTTP/UI logs, forged token/non-admin rejection, session continuity and privacy.
- [ ] Verify Production readiness/finance/backup/rollback gates and preserve old services.
- [ ] Promote with zero downtime and independently verify Production SHA and actual page/API.

## Before-work observed facts / no deployment
- Existing Production and official Test `/admin/logs/system` returned 404; current Production Spring source is older than main.
- Official `test-main-backend.service` is **inactive and disabled**. Test public `/health` and `/api/version` explicitly proxy to the same Spring `:4550` used by Production; Test anonymous auth session API and system logs return HTTP **502**. This is **not an isolated Test** and cannot certify Production.
- Host release identity preflight `--channel test --sha b6d013...` exits 1 (inactive service). Current Test manifest/frontend SHA `cfc178ab...`, not candidate; candidate built frontend BUILD_ID is timestamp-based, not exact SHA, and old host staging script expects Nest `backend/dist/main.js` absent from the candidate.
- Production and Test independent readiness gates therefore currently **BLOCKED**; do not bypass them via direct copy, restarts, or Nginx switching.
- At inspection, PR #3205 runtime-check checks were IN_PROGRESS. No approval or evidence that complete CI passed.

## IN PROGRESS
- Record exact official Test provisioning blockers and assess whether non-disruptive restoration with an independent Test DB is possible.

## FINISHED
- Pending final evidence and release decision.
