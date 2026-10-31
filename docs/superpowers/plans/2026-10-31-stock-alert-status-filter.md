# Stock Alert Condition Filter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Authenticated members can filter their active virtual-stock alert rules by current server-evaluated condition (all, met, watching) in web and Android, without changing alert evaluation or balances.

**Architecture:** Reuse existing `public.stock_alert_rules_list(p_actor)` SECURITY DEFINER read; filter its actor-scoped rows in a parameterized outer SELECT, with strict Nest and app-api query validation. Next renders a native GET form; Android rejects a stale backend that ignores the filter. No new migration or table grants.

**Tech Stack:** NestJS, PostgreSQL 17, Next.js App Router, TypeScript, Vitest, Supertest.

**Spec:** Existing `docs/planning/PROJECT_PLAN.md` and `docs/planning/PROJECT_PLAN.ko.md`; focused read-only member alert UX extension, no financial writes.

## Global Constraints
- English canonical; Korean equivalent worklog and QA.
- Main 5bccda44d6db56aff05fa5623ef7f72b2ec0263c, separate branch/worktree, no other worker mutations.
- No new migration, no ledger, no app-role direct table grants, no production changes.
- No cached owner responses, noindex, reject duplicate/unknown filter and stale 200.
- E2E official exact SHA and release gates mandatory for merge; otherwise DRAFT/HOLD.

## Review Focus
- `?status=met&status=watching` must be 400 without querying owner data.
- Stale HTTP 200 containing unfiltered rows must be rejected by Android gateway.
- Null/invalid `condition_met` must never be treated as false (watching).
- `stock` deep link must survive status selection without becoming another owner selector.
- DB function must retain owner scoping; no direct table read or writes.

## Tasks
- [ ] Write backend repository + HTTP RED tests for all/met/watching and invalid/duplicate status.
- [ ] Implement parameterized repository filter and controller validation; GREEN.
- [ ] Write frontend RED tests for status parsing/deep-link preservation; implement accessible GET selector and verified empty copy; GREEN.
- [ ] Write app-api RED tests for query and stale 200; implement fail-closed verifier and private headers; GREEN.
- [ ] Run lint/typecheck/test/build/security/isolated PostgreSQL; record exact SHA evidence, create Draft PR; do not merge unless official Test E2E, CI, restore and release gate pass.
