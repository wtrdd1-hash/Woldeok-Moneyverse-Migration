# Admin Member Snapshot Evidence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Prevent a bounded administrator member snapshot from being represented as a complete membership and population-wide economic/engagement audit.

**Architecture:** Existing admin-only NestJS controller performs a bounded 51-row lookahead through the PostgreSQL SECURITY DEFINER read model, returns the first 50 with explicit `WEALTH_ORDERED_SNAPSHOT` scope and `hasMore`. Next server page validates the response and member money strings before rendering. Client shows accessible sample-scope notice, labels metrics as snapshot and hides population-wide telemetry when incomplete.

**Tech Stack:** NestJS, Next.js, TypeScript, Vitest, PostgreSQL read model.

## Task 1: Backend evidence contract
- [ ] Write RED controller tests for 51-row lookahead, truncated 50-row response and exactly-50 complete result.
- [ ] Implement minimal controller contract without altering existing SQL or role guards.
- [ ] Run GREEN backend tests.

## Task 2: Frontend validation and scope
- [ ] Write RED parser tests for missing metadata, malformed IDs, invalid WLD and duplicate records.
- [ ] Implement strict fail-closed server response parser; distinguish error from empty result.
- [ ] Write RED/GREEN UI tests for sample notice, scope-limited search and hidden population-wide analytics.
- [ ] Verify 44px touch targets, keyboard/screen-reader scope notice, noindex and responsive layout.

## Task 3: Release evidence
- [ ] Re-fetch main and both planning hashes mid-run, reconcile changed files if necessary.
- [ ] Run HEAD exact-SHA focused/full test, lint, typecheck, builds, security audits, app-api contract, isolated real-PG CI.
- [ ] Create Draft PR only; merge and deploy only if all security and official exact-SHA Test E2E gates PASS.
- [ ] Record EN canonical / KO supplemental worklogs and release/rollback/retention evidence.
