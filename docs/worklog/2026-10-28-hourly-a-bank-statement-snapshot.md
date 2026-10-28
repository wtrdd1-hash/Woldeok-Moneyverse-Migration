# A1657 — Member bank standing snapshot download

## Before work (2026-10-28 16:57 KST)
- Source: `origin/main` `d12c948ac454b0762cfb7fb0cddf83703a775172` at checkout. Read AGENTS, README, canonical English/Korean planning and QA v1344.
- Existing member bank standing reads `public.bank_get_my_standing(actor)` through `BankRepository`; no member CSV statement export. Scope: owner-only, read-only cash/deposit/interest/active-loan snapshot with exact integer strings, browser CSV and Android JSON parity. No new migration, balance changes, privilege changes, or finance reconciliation claim.
- P0 blockers: data disk 97%, live 18,000 WLD balance/ledger drift, broad application DB privileges, official Test exact-SHA not certified; Production HOLD.
- [x] Check remote main, prior QA and open PRs. [x] Create isolated worktree. [x] RED tests (3 backend fail; frontend module missing). [x] Backend/API/DB read. [x] Browser CSV CTA. [x] Android gateway contract. [ ] Full gates and QA. [ ] PR and release decision.

## In progress (2026-10-28 17:02 KST)
- Added owner-only GET banking/standing/snapshot using existing SECURITY DEFINER bank_get_my_standing(actor), strict integer-string validation and a bounded read-only response. No new migration.
- Added same-origin member-gated CSV route and UI CTA, Android gateway no-store/noindex, negative/large-amount and auth tests. GREEN: backend focused 3/3, frontend focused 32/32 (2 CSV + 27 Android + 3 route).
- No mutation to existing workers, Production or PostgreSQL. Full gates and isolated PostgreSQL pending.

## Finished
- Pending independent verification.
