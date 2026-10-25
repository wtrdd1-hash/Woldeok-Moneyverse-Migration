# Auction ledger-integrity containment implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans; TDD RED→GREEN→REFACTOR.

**Goal:** Prevent unjournaled auction bids and fabricated escrow confirmations while allowing verified read-only auction browsing.

**Architecture:** NestJS auction create/bid commands fail closed with HTTP 503 before any SQL or websocket side effect; GET continues read-only. Next.js auction panel starts empty, loads only validated server listings, distinguishes verified empty/error, and explains why bidding is paused. Android gateway passes through authenticated backend 503 with no-store response.

**Tech Stack:** NestJS, Next.js, TypeScript, Vitest, PostgreSQL.

**Spec:** Existing migration 232 and integrated planning master security/release gates, A1225 worklog.

## Global constraints
- No edits to applied migrations, no broad DB grants, no ledger writes, no production DB tests, no optimistic WLD receipts.
- No other agent branch/worktree changes; Draft PR and release hold without exact-SHA green CI/security/Test E2E.

## Tasks
1. [ ] Add backend negative tests asserting create/bid refuse before SQL, including an env-flag bypass attempt; run RED.
2. [ ] Add frontend tests asserting no fabricated initial listings and no false success on network error; run RED.
3. [ ] Add Android gateway route/CSRF and status propagation tests; run RED where applicable.
4. [ ] Implement backend mutation hold and frontend verified read-only UI; run focused GREEN.
5. [ ] Recheck main and planning, run all gates and isolated PostgreSQL read-only checks, log exact SHA and blockers.
6. [ ] Push Draft PR; never merge/promote without all gates PASS.
