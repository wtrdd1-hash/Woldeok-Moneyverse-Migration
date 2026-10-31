# Development C v1253 — Marketplace auction provenance containment

## Before work — 2026-11-01 08:46 KST
- Baseline: `f13bbce273ffc65e8576170992d82ea00c27a1c9` (`origin/main` re-fetched).
- Debian 13.6 miniPC: seven services active, development PostgreSQL connected (system status checked).
- Read AGENTS.md, README.md, README/README.ko.md, English canonical and Korean supporting PROJECT_PLAN; inspected 57 open PRs and latest A/B/QA/Planning work. B #2221 owns service settlement hold; this change addresses *unverified auction read and browser demo*, not its four mutation methods. Main has an unrelated modified `implementation_plan.md` preserved untouched.
- P0 source gap: `/marketplace/auction` renders four hardcoded auctions, 250000 WLD member balance and 842500 WLD burned, and unverified live ticker/VIP state. Backend `/api/v1/marketplace/auctions` reads raw `marketplace_auctions`, which migration 232 explicitly seeds with invented listings/bids. Neither is evidence of actual owner inventory or escrow. Backend bid already fail-closes, but read still surfaces sample financial claims.
- Scope: block uncertified auction read at service boundary (HTTP 503 through existing authenticated controller), replace member auction page with explicit unavailable/read-only explanation, remove demo balances/ticker/bid UI, keep accessible navigation and retry. No schema/ledger/production changes.
- RED: new service test must show source list cannot return seeded rows, new page tests must reject fabricated financial amounts and bid controls. GREEN: service 503, page no financial claims. Run focused tests and full gates; release HOLD unless all required exact-SHA gates pass.

## In progress
- [ ] RED tests
- [ ] Source and page containment
- [ ] Focused verification
- [ ] Full exact-SHA validation and CI
- [ ] Main re-fetch, PR and release decision

## Finished
Pending.
