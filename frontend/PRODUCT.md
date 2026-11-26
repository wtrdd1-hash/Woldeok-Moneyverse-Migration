# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Korean members of the 월덕 (Woldeok) community who play an economy game together. They come
back regularly, mostly on phones, to claim the daily reward, check their wallet and bank, trade
on the virtual stock exchange, run businesses, do quests and talk on the plaza. Confirmed by the
owner (2026-11-26): it is first a community economy game members enjoy; learning about money is
a side effect, not the job.

## Product Purpose

A shared virtual economy with one currency, WLD. Every balance comes from a double-entry ledger
in PostgreSQL; money moves only through journaled database functions. Success: members return
daily and trust that what the screen shows is what the ledger holds.

## Positioning

A community's own economy, not a solo idle game: one treasury, one central bank, one stock
exchange shared by everyone in 월덕, with every figure traceable to a ledger receipt.

## Operating Context

- Next.js frontend (BFF) in front of a Spring Boot API; Test (test.easy-scraping.com) before
  Production (easy-scraping.com), always.
- Locales ko (default), en, ja, zh, vi.
- About 147 routes: home, wallet, bank (deposits, pockets, bonds, loans), stocks, businesses,
  shop, quests, progression, plaza/board, clubs, gallery, account and security, admin console.

## Capabilities and Constraints

- WLD is game currency, not money; copy states this where money appears.
- Casino, FX and deposit insurance are deliberately closed (honest 503/403), not hidden bugs.
- A figure with no certified source is withheld ("불러오지 못했어요"), never estimated.
- Korean product copy belongs to the owner; design work does not reword it.

## Brand Commitments

- Keep the 월덕 logo (`public/images/woldeok-official-icon.png`) and the name 월덕 머니버스.
- Nothing else in the current look is binding (owner, 2026-11-26): colour scheme, dark mode and
  the five-tab mobile dock may change in the redesign.

## Evidence on Hand

- Real data: ledger-backed balances, stock prices, quests and board posts on Test and Production.
- No testimonials, press, user counts or benchmarks exist; none may be invented.

## Product Principles

1. The ledger is the truth: show receipts, never guesses.
2. Daily return over one-time spectacle: the first screen answers "what can I do today".
3. Shared economy: the community, treasury and market are visible, not just the member's purse.
4. Phone first: one-handed use is the default case.

## Accessibility & Inclusion

44px touch targets, visible keyboard focus, WCAG AA contrast, Korean line breaking (keep-all).
