# Published Announcement Title Search Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Let visitors search titles in the latest 50 published announcements, consistently on web and Android, without implying a full-history search.

**Architecture:** Reuse the PostgreSQL SECURITY DEFINER published-only function; filter its bounded output with parameterized SQL and stable pinned/date ordering. Preserve the public ISR route and add a small client-side title filter. Validate Android query shape and returned public notices fail-closed.

**Tech Stack:** NestJS, Next.js, PostgreSQL 17, Vitest, node:test.

**Spec:** This document; approved public-only read with no new migration or monetary write.

## Global Constraints
- Do not touch applied migrations or grant table access; never expose unpublished notices.
- Default public API remains 20 notices; explicit limit 1..50; title q 1..80 chars, literal substring.
- Search is explicitly limited to the latest 50 published notices, not complete archive.
- Preserve pinned/date order and static public SEO.

## Review Focus
- Duplicate q/limit rejected, no SQL injection or wildcard semantics.
- Published-only function remains the data boundary; zero matching rows is not a server error.
- Unverified Android HTTP 200 fails closed, and public response cannot carry drafts.
- Keyboard label and search status accessibility; no accidental private SEO policy.
- PostgreSQL title case-folding and browser filter agree for Korean and ASCII samples.

### Task 1: Database-backed public read and Nest API
- [ ] Add failing repository/controller tests for q, strict limit and query binding.
- [ ] Implement bounded function-backed SQL filter, service forwarding, controller parsing.
- [ ] Run targeted tests; record RED and GREEN.

### Task 2: Web search
- [ ] Add failing component tests for title filter and 50-row disclosure.
- [ ] Implement accessible client filter and keep page ISR.
- [ ] Run targeted tests; record RED and GREEN.

### Task 3: Android app-api contract
- [ ] Add failing request/response tests for duplicate, malformed and dishonest upstream.
- [ ] Implement fail-closed response validation and bounded query.
- [ ] Run targeted tests; record RED and GREEN.

### Task 4: Gates and release
- [ ] Refresh main and plan; run full required tests, build, lint, typecheck, real PG, security, SEO, accessibility, app-api, E2E.
- [ ] Push branch, open Draft PR; merge/deploy only with exact SHA Test and release evidence.
