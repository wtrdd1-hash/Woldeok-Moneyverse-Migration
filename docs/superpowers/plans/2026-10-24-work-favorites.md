# Work Favorites Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans and superpowers:test-driven-development.

**Goal:** Give authenticated members a private, bounded work-task shortlist with truthful save/remove readback.

**Architecture:** An additive PostgreSQL table is writable only through SECURITY DEFINER functions with owner-scoped reads and row locking. NestJS guards authenticate API calls; Next.js server actions and the existing Android app-api gateway share the endpoint. No ledger, work assignment, or reward changes.

**Tech Stack:** PostgreSQL, NestJS, Next.js, Vitest.

**Spec:** docs/planning/INTEGRATED_PLANNING_MASTER.md (F675-112 v1220/v1222; scoped first slice)

## Global Constraints
- Work from latest main in isolated branch; no live DB migration.
- 50 active favorites maximum, idempotent explicit saved state, owner isolation.
- Server-authoritative work eligibility; no cached reward promise.
- No public table DML, no public function EXECUTE; no WLD mutations.

## Tasks
- [ ] Add failing API and frontend regression tests; verify RED.
- [ ] Implement additive SQL schema, scoped list and set functions with concurrency lock and ACL.
- [ ] Add Nest repository/controller and authenticated endpoint tests.
- [ ] Wire server action and accessible UI into work task board; preserve unavailable states.
- [ ] Confirm Android gateway and no-store headers with focused tests.
- [ ] Run build/lint/typecheck/test/isolated PG/security gates, recheck main and CI; hold merge on any failures.

## Integration hold
Migration 280 is concurrently claimed by unmerged B PR #1105 and #1117. This branch does not overwrite their files. Resolve migration ordering in a fresh integration branch after their ownership decision; never merge conflicting 280 filenames or edit an applied migration.
