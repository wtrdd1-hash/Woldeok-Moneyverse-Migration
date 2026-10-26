# Recent Support Conversation Status Filter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Let members filter their recent support conversations by case status without incorrectly claiming that a bounded result is their complete history.

**Architecture:** Reuse existing support_my_threads(p_actor, p_limit) PostgreSQL SECURITY DEFINER function (max 100), deriving p_actor exclusively from the authenticated backend session. Return a server-declared 100-item window through existing API and Android gateway. Filter only that bounded window in the Next.js member view; preserve owner-only message access, explicit deep links, noindex, and no-store semantics. No schema/migration or WLD writes. This avoids the known four-way collision on migration 280.

**Tech Stack:** NestJS, Next.js, TypeScript, Vitest, PostgreSQL 17.

**Spec:** Existing docs/planning/INTEGRATED_PLANNING_MASTER.md support attention boundaries and docs/planning/PROJECT_PLAN.md; this change is strictly a recent-window status filter, not unread-message detection or full archive.

## Global Constraints
- Source of truth: remote main 1c5b84a1c45baafcca83f375a6f99698121e9bb5 as of 2026-10-26 15:30 KST.
- No applied migration edits, no new migration number 280, no app table grants.
- SessionGuard/AuthenticatedGuard/ConsentGuard and server-derived actor only.
- No claim that zero matching threads in most recent 100 means zero matching threads in full archive.
- Preserve deep links and show partial-window semantics explicitly; no cache of private threads.
- No merge or Production release without full exact-SHA CI, isolated real PostgreSQL, authenticated Test and security gates.

## Review Focus
1. More than 100 threads: filter result is only recent 100; never claim full-history absence.
2. Foreign thread deep link: database ownership still blocks message reads; no cross-account data.
3. Invalid status parameter: fall back to all; no arbitrary SQL/filter injection.
4. Unlisted selected thread: preserve deep-link access through owner-checked API without claiming it appears in filter.
5. Auth expiry/backend failure: propagate failure, never fabricate empty results.

### Task 1: Backend + Android contract
- [ ] Write failing controller test: only session-derived actor, query limit 100, explicit windowLimit.
- [ ] Run focused test RED.
- [ ] Update controller; keep existing route and guards.
- [ ] Run focused test GREEN and API contract generation/check.

### Task 2: Member filter
- [ ] Write failing helper tests for status parsing and recent-window filtering.
- [ ] Run focused test RED.
- [ ] Implement pure helper and filter links, bounded copy, accessible status labels, preserve deep links.
- [ ] Run focused test GREEN and accessibility checks.

### Task 3: Real PostgreSQL and release evidence
- [ ] Test existing function against isolated Test PostgreSQL 17 with owner/non-owner and rollback fixture, no production writes.
- [ ] Run focused + full lint/typecheck/test/build/security/Android/SEO gates on exact final SHA.
- [ ] Re-fetch main and planning candidate; if any gate fails, Draft PR/HOLD only.
- [ ] Write QA/release/worklog EN/KO with exact SHA, CI, branch preservation and rollback.
