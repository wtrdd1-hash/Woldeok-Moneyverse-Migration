# Owner-only Casino Recent Play Summary Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let an authenticated member inspect verified last-20 casino stakes and net outcomes without inventing winnings or changing the ledger.

**Architecture:** Reuse existing `member_casino_history(actor,20)` SECURITY DEFINER read via `CasinoRepository.history`. New NestJS GET `/casino/history/summary` aggregates exact integer-string stakes/net and returns authoritative rows. Next.js private `/arcade/history` displays receipt-linked data, not a fabricated lifetime or daily total; Android app-api passthrough and generated contract expose the same authenticated route.

**Tech Stack:** NestJS, Next.js App Router, TypeScript BigInt, Vitest, PostgreSQL 17, pnpm.

**Spec:** Existing `docs/features/casino.md`, `AGENTS.md`, `docs/planning/INTEGRATED_PLANNING_MASTER.md`; no new SQL migration or financial writes.

## Tasks
- [x] Write failing BigInt summary tests: empty, signed, huge integers, malformed response, 20 limit; run RED.
- [x] Implement pure summary aggregation and guarded owner-only GET route; run GREEN and auth route tests.
- [x] Write failing frontend view and app-api passthrough tests; implement private/noindex/no-store page and discoverable navigation, update Android contract; run GREEN.
- [ ] Verify real isolated PostgreSQL owner-only function EXECUTE and no ledger write grants in read-only rollback transaction.
- [ ] Run lint, typecheck, full unit/integration, build, security, a11y/SEO, app-api and exact SHA CI. HOLD if any gate fails.
- [ ] Recheck latest main and plan before integration; do not merge/deploy without full official Test exact SHA authenticated finance E2E and security PASS.

## Safety / rollback
No migration, grants, balance writes or deployed changes. Revert only the new feature branch/PR if needed; preserve all other worktrees and branches. Private API response and UI must not be cached; failed read must not become a zero balance. Empty history is not a lifetime claim. No client-provided actor, no unsafe Number conversion. `member_casino_history` remains DB authority.
