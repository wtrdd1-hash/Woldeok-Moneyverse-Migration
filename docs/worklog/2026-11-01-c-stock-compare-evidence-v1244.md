# Development C v1244 — Virtual Stock Comparison Source Evidence

## Before work — 2026-11-01 02:44 KST
- Host: Debian 13 miniPC, seven services active, development PostgreSQL connected (system status read). Main fetched: `f13bbce273ffc65e8576170992d82ea00c27a1c9`.
- Read AGENTS.md, README.md, README/README.ko.md, both canonical planning files, open PRs/CI, QA v1425 and A/B/C branches. Main checkout contains an unrelated modified implementation_plan.md; untouched.
- Independent branch/worktree created from `origin/main`. No overlap with A inventory/announcement, B ledger/Telegram or C pension/stock alerts/watchlist.
- Source finding: `frontend/src/app/stocks/compare/page.tsx` uses a compile-time type assertion on GET `/api/v1/stocks`, then passes unchecked `stocks` to `StockComparison`. Invalid/duplicate entries can crash BigInt calculations, misstate comparisons or render duplicated selector IDs. Backend list uses `stock_market_overview()` read-only SQL, so no new API or DB write is required.
- Bounded fix assumption: validate the complete response and refuse comparison on invalid evidence; distinguish API failure, invalid response, and verified fewer-than-two stocks. Preserve 2–3-stock selection, no simulated prices. Explicitly mark data as last reported, not certified real-time.
- Gate: TDD red/green; changed-file lint; exact-HEAD lint/typecheck/build/tests, app-api, security, isolated PostgreSQL and authenticated E2E if feasible. No merge or deployment until all pass.

## In progress
- [ ] Reproduce malformed and duplicate stock response in failing tests.
- [ ] Implement strict runtime validation and accessible unavailable/retry state.
- [ ] Run gates, record exact HEAD, re-fetch main and PR/CI changes.

## Finished
- PENDING — never interpret a missing gate as PASS. Main/Test/Production untouched until authorized gates pass.
