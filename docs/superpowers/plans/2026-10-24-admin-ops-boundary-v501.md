# Administrator Operations Boundary Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close unauthorized backup execution and telemetry disclosure without breaking the admin dashboard.

**Architecture:** NestJS guard metadata enforces both role and active administrator session. Backup mutation requires recent reauthentication and CSRF. Next.js server action performs the authorized mutation using existing CSRF-aware `mutate`, and the client displays only an accepted request, not a verified completed backup.

**Tech Stack:** NestJS, Next.js, TypeScript, Vitest.

**Spec:** `AGENTS.md` section 5; `docs/planning/PROJECT_PLAN.md` release and security constraints.

## Global Constraints
- Preserve existing session, consent and CSRF protection; do not loosen guards.
- No DB writes, migration, deployment, live backup execution or Production tests.
- Keep A/C/QA and Gemini branches untouched; release HOLD until all gates.

## Review Focus
- Authenticated non-admin cannot list backups or access host telemetry.
- Admin without active console session cannot read or trigger backups.
- CSRF and recent reauthentication required for backup trigger.
- Browser must not POST directly without CSRF.
- A request accepted is not proof a backup completed.

## Task 1: Backend guard regression
- [ ] Add metadata assertions for class-level AdminGuard and AdminSessionGuard on both controllers and method-level ReauthGuard on trigger.
- [ ] Run focused Vitest, capture RED.
- [ ] Implement guards and rerun GREEN.

## Task 2: Frontend safe trigger
- [ ] Add tests proving server action calls `mutate` and validates accepted response; browser UI no longer sends direct POST.
- [ ] Run RED, then implement server action and UI, rerun GREEN.

## Task 3: Verify and publish
- [ ] Run lint/typecheck/build/unit/security/CI as feasible, log exact results and skips.
- [ ] Fetch main and recheck plan, inspect diff and record final SHA.
- [ ] Open Draft PR only; do not merge or deploy without official Test exact-SHA.
