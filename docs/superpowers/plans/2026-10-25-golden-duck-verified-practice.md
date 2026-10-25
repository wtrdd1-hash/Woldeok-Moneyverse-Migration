# Golden Duck Verified Practice and Reward Hold Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep the ten-second Golden Duck tapping game playable without inventing WLD rewards, while providing a member-scoped, read-only ledger claim status to web and Android.

**Architecture:** NestJS rejects new Golden Duck reward writes (503) until a migration-owned atomic daily claim exists. A read-only owner-filtered PostgreSQL ledger query reports historical claim existence, or fails closed on DB error. The browser renders explicitly local practice points and an honest status; app-api proxies the same authenticated read and rejection.

**Tech Stack:** NestJS, Next.js, Vitest, PostgreSQL 17, Android app-api BFF.

**Spec:** P0/P1 money integrity instructions, AGENTS.md, docs/planning/PROJECT_PLAN.md and INTEGRATED_PLANNING_MASTER.md (English canonical, Korean companion); no alteration of integrated planning files.

**Constraints:** No new migration, no balance or ledger writes, no Production/Test promotion without full gates, protect B/C/Gemini worktrees, no fake success. New financial settlement is separate issue.

## Tasks
- [ ] TDD RED: Backend status tests for owner scope, no repository, and fail-closed reward POST; frontend practice tests for no WLD/no network reward and honest status.
- [ ] GREEN: Add `DopamineRepository.goldenDuckLedgerStatus` owner-scoped query with Seoul-day bounds; backend GET status, POST 503, aggregate status available=false.
- [ ] GREEN: Render practice-only Golden Duck tap score and read-only ledger status through Next server action; remove all wallet events and fake reward callbacks; update station copy.
- [ ] Android gateway contract test: GET status owner session, POST hold and CSRF forwarding; no direct client API credentials.
- [ ] Real isolated PostgreSQL read-only ACL/owner scope proof; focused tests; full lint/typecheck/test/build/audit; record exact SHA and blockers.
- [ ] Refresh main/EN+KO planning at midpoint and before any merge. Draft PR only if release gates fail; never delete unmerged branches.
