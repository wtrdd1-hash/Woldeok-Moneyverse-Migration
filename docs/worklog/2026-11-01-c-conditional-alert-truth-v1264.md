# C v1264 — Stock conditional order source truth (canonical)

## BEFORE WORK — 2026-11-01 15:40 KST
- Base: `1e389dc1a6b253f7dbff7cc6765fbe4a17bcb9e0` (`origin/main` fetched).
- Debian 13 miniPC: 7/7 core services active, development PostgreSQL connected; no shared service or database writes planned.
- Reviewed AGENTS.md, README.md, README/README.ko.md, English/Korean integrated project plans, open PRs, current A/B/QA branches and CI. Main planning snapshot v1518 is a historical release-hold document; newer planning PR #2335 is draft and not merged.
- Existing client `stock-conditional-orders.tsx` stores rules in browser localStorage, marks simulated threshold crossings `TRIGGERED`, and plays trade-success audio without a server order or ledger receipt. It advertises automatic market sells; user/account scoping and durable execution do not exist. This is a P0 false-trade claim.
- Existing authenticated `POST /api/v1/stocks/alerts` + owner readback action and migration 182 provide actual persistent, owner-scoped, CSRF-protected *notification-only* alerts. No server conditional sell contract exists.
- Non-overlap: A #2337 board order, B #2332 crafting, QA #2326 mini-showdown, C #2336 venture; #2322 stock depth is distinct.
- Decision: replace the deceptive browser-only conditional-order surface with a truthful, accessible entry to existing persisted stock price alerts; explicitly state that no automatic sell or WLD transaction occurs. Do not add financial writes or alter SQL grants.

## Plan / checkpoints
- [x] Establish isolated worktree and inspect authority and competing work.
- [x] RED: three new tests failed against the original simulated local-only execution UI.
- [x] GREEN: remove local-only rules and fabricated trade receipts; use existing owner-verified alert action/dialog and alert listing.
- [ ] Verify responsive/keyboard/screen reader and security/DB/API contracts.
- [ ] Run exact-SHA gates, CI, main recheck; hold release on any missing gate.

## IN PROGRESS
RED reproduced (3/3); replaced conditional-order client with server-backed price-alert entry, preserved stock detail and mobile/desktop component interface. Legacy browser state is never read, written, or interpreted as a trade. The pre-existing alert action verifies a returned UUID against the owner-scoped database readback. Focused tests and full gates pending.

## FINISHED
Pending validation and release decision.
