# Backend B v556 — SSRF DNS-to-connect pinning (2026-10-26)

## Before work
- Start main: `1c5b84a1c45baafcca83f375a6f99698121e9bb5` (fetched from origin).
- Isolated branch: `auto/hourly-b-ssrf-dns-pin-v556-20261026-1435`.
- Read AGENTS.md, README.md, English/Korean project plans, release guide, relevant TDD/worktree/verification skills; reviewed current PRs, QA and CI.
- P1 #1369: DNS check and fetch connection resolve separately. PRs #1368 and #1392 touch same module; preserve their changes and flag integration order.
- No live DB writes, feature switch changes, existing worktree modifications, merge or deployment.

## In progress
- [x] RED: prove validated DNS address not bound to outbound socket.
- [x] GREEN: pin validated address for each hop, fail closed on mixed/private answers and preserve hostname TLS/Host.
- [ ] Tests: focused, typecheck, lint, build, integration/security, full CI, isolated PostgreSQL and Test exact-SHA as feasible.

## Finished
- Pending full gates. RED 3/4 initial tests failed as expected. GREEN 18/18 focused SSRF and redirect tests passed. Typecheck backend passed after contract build. New dependency `undici@7.16.0` for per-request pinned DNS connector. No API/DB schema changes.
- Risk: overlapping PR #1368 (IPv4-mapped classification) and #1392 (abort deadline); reconcile before merge. No deploy authorized.
