# A1657 — Member bank standing snapshot download

## Before work (2026-10-28 16:57 KST)
- Source: `origin/main` `d12c948ac454b0762cfb7fb0cddf83703a775172` at checkout. Read AGENTS, README, canonical English/Korean planning and QA v1344.
- Existing member bank standing reads `public.bank_get_my_standing(actor)` through `BankRepository`; no member CSV statement export. Scope: owner-only, read-only cash/deposit/interest/active-loan snapshot with exact integer strings, browser CSV and Android JSON parity. No new migration, balance changes, privilege changes, or finance reconciliation claim.
- P0 blockers: data disk 97%, live 18,000 WLD balance/ledger drift, broad application DB privileges, official Test exact-SHA not certified; Production HOLD.
- [x] Check remote main, prior QA and open PRs. [x] Create isolated worktree. [ ] RED tests. [ ] Backend/API/DB read. [ ] Browser CSV CTA. [ ] Android gateway contract. [ ] Full gates and QA. [ ] PR and release decision.

## In progress
- No mutation to existing workers, Production or PostgreSQL.

## Finished
- Pending independent verification.
