# Verified Help Replay Truth — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans with RED-GREEN-REFACTOR and verification-before-completion.

**Goal:** An idempotent replay must never falsely report a draft or publication after the article has moved to a later state.

**Architecture:** Keep the existing verified-help full-stack implementation in a new branch from current main. Amend only the unapplied 280 SQL and isolated PostgreSQL fixture. On a matching replay, lock the article and confirm the state before returning the old receipt. Fail with SQLSTATE 40001 when stale; existing NestJS controller maps this to HTTP 409. Keep original idempotency digest and database role checks.

**Tech Stack:** PostgreSQL 17, NestJS, Next.js, Vitest, Android app-api gateway.

**Spec:** docs/superpowers/plans/2026-10-27-verified-help-center.md and latest docs/planning/INTEGRATED_PLANNING_MASTER.md (planning Draft/HOLD).

## Global Constraints
- Do not edit applied migrations or production checksums; 280 is an unmerged candidate and collides with other Draft PRs.
- No write to production-linked database or official Test; use isolated tmpfs PostgreSQL only.
- Do not alter A/B/C/Gemini/QA worktrees. Keep Draft/HOLD until all gates pass.

## Task 1 — Reproduce stale receipt
- [x] Add SQL fixture assertions: after retraction, same-key publication replay and same-key draft replay must raise serialization_failure (40001); before retraction identical replays still succeed.
- [x] Run fixture on isolated PG and capture expected RED failure.

## Task 2 — Fail closed in SQL
- [x] In draft and publish replay branches, lock article row and verify state matches original operation.
- [x] Run fixture on isolated PG and capture GREEN; test other existing fixtures.

## Task 3 — Verify integration and preserve
- [x] Add NestJS HTTP 409 mapping regression if not already covered.
- [x] Run targeted and whole-project gates, isolated PG, security audit; record security and exact-SHA release gate as BLOCKED.
- [ ] Re-fetch main and latest plan; write EN+KO worklog/QA, commit, push Draft/HOLD PR, do not merge or deploy if any gate fails.
