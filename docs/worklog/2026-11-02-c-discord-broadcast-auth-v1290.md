# Development C v1290 — Discord broadcast gateway authorization and receipt truth
## Before work — 2026-11-02 08:45 KST
- Status: IN PROGRESS; no production or test deployment authorized.
- Baseline: origin/main a8541927c3a351d980454c66e95a3356c47e0722.
- Debian 13 miniPC: connected; seven services active; development PostgreSQL connected.
- Reviewed AGENTS.md, README.md, README/README.ko.md, both living project plans, open PRs (A #2448, B #2447, C #2446, QA #2398), and current CI. No open PR targets the Discord broadcast gateway.
- P0 evidence: Next POST /api/discord/broadcast accepts a fixed fallback secret as authentication, enabling unauthenticated requests to be treated as internal when neither env secret is configured. The same handler treats malformed successful bot responses as delivered. Browser administrator requests have no origin check. Bot listener is loopback-only; the public ingress is the Next route.
- Scope: remove default credential; compare only a configured sufficiently strong secret; require same-origin administrator browser requests; validate bounded input; verify actual bot receipt; preserve existing legitimate caller contract. No DB, ledger, or runtime changes.
- Plan: write failing route tests, observe RED, implement minimal safe gateway, observe GREEN, run complete repository gates, re-fetch main, publish draft PR only; release HOLD on any gate failure.
## In progress — 08:50 KST
- RED: 20/21 focused tests failed on the original route, demonstrating absent runtime env-secret support, missing Origin/shape checks, and unverified bot receipt acceptance.
- GREEN: 23/23 focused tests pass after implementation; frontend TypeScript typecheck PASS after fixing a strict indexed access issue.
- Gateway now requires a configured 32–512 byte secret, timing-safe comparison, same-origin administrator browser authority, bounded JSON/field validation, private HTTP response headers and bot acceptance receipt.
- No production secret value recorded. No service restarted or DB/ledger changed.
- Re-fetched origin/main mid-task; remains a8541927c3a351d980454c66e95a3356c47e0722.
- Next: full gates and CI; release remains HOLD.
## Finished
- Pending.
