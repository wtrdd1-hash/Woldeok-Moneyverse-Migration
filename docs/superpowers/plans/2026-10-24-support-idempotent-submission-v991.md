# Idempotent Support Submission Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Prevent duplicate durable member support threads/messages caused by repeated submission or retry of the same form.

**Architecture:** Keep existing authenticated Next server actions and NestJS + PostgreSQL SECURITY DEFINER functions. Generate an idempotency UUID once when rendering each form; validate it in the action and forward unchanged to the API. Redirect only after a confirmed thread receipt, without a forged success query parameter.

**Tech Stack:** Next.js server actions, Vitest, NestJS, PostgreSQL 17.

**Spec:** `docs/worklog/2026-10-24-hourly-c-v991.md`

## Global Constraints
- No new API, migration, direct table grant, money movement, Production change, or main edit.
- Maintain CSRF, actor ownership, mobile and keyboard semantics, noindex.

## Tasks
1. [x] Add action regression tests proving same form key forwarded unchanged on retry, malformed keys rejected without API writes, and created-thread receipt determines redirect. Run tests to observe RED.
2. [x] Implement minimal actions and server-rendered hidden UUID fields; validate UUID before API calls. Run focused tests GREEN.
3. [x] Add regression tests for server page key binding, accessible field labels and SEO, then verify focused tests.
4. [ ] Fetch main/plan again, run exact-SHA gates, inspect CI, record blockers; open Draft PR only unless all release gates pass.
