# Owner-scoped Support Message Receipt Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Let authenticated members verify a specific persisted support reply beyond the first 200 messages without exposing other members' content.
**Architecture:** New immutable forward migration 295 defines an owner-scoped SECURITY DEFINER exact lookup. NestJS exposes a read-only UUID-validated, no-store endpoint; C v1153 separately integrates the Next.js UI.
**Tech Stack:** PostgreSQL 17, NestJS, TypeScript, Vitest.
**Spec:** GitHub issue #1832 and migration 196.

## Global Constraints
- Never edit applied migrations; never grant direct support table SELECT to moneyverse_app.
- Preserve current 200-message list route; no financial or Production writes.
- Keep C v1153 Draft isolated and coordinate via PR comment.

## Review Focus
- Forged/nonowner thread and message UUID must never disclose content.
- Missing receipt must be 404 only after owner authorization.
- Identical message bodies must not be confused with identity.
- 201+ messages must remain individually verifiable.
- PUBLIC must not execute the new function.

### Task 1 — Read-only exact receipt contract
- [ ] Write failing controller/repository tests.
- [ ] Verify RED.
- [ ] Add forward-only 295 SQL and repository/route.
- [ ] Verify GREEN and check no-store/guard behavior.
- [ ] Commit checkpoint.

### Task 2 — Isolated PostgreSQL and release gates
- [ ] Verify owner/other-owner/201st-message, direct-table and PUBLIC ACL in disposable PostgreSQL.
- [ ] Run full workspace tests, typecheck, lint, builds, audit, CI.
- [ ] Re-fetch main and plans; document remaining blockers.
- [ ] Push Draft/HOLD PR and C handoff; do not merge without all gates.
