# Private Wallet Recipient Search Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Prevent wildcard-based member enumeration and excessive recipient queries while preserving authenticated, owner-excluding P2P recipient lookup for web and Android.

**Architecture:** The existing Nest wallet service and PostgreSQL repository remain the authoritative owner-scoped lookup. Validate bounded Unicode query length and escape SQL LIKE metacharacters; the Next BFF and modal mirror the bound to avoid unnecessary requests. Existing app-api gateway continues to reach the same Nest guard and repository without a separate unauthenticated search path.

**Tech Stack:** NestJS, PostgreSQL, Next.js, Vitest, TypeScript.

**Spec:** `AGENTS.md` authorization/DB policy and `docs/planning/PROJECT_PLAN.md` W680 privacy.

## Global Constraints
- No new table grant, migration, user data writes, money mutation, cache, or backend authentication bypass.
- Preserve max 10 recipients, exclude actor, active users only, and no unbounded query.
- Do not touch the independent P2P retry PR #1026 or QA CSV PR.

## Review Focus
- Literal `%`, `_`, and backslash must not become SQL wildcards.
- One-character and >40 Unicode-codepoint searches must never query the DB.
- Guest must never cause a backend lookup; responses must be private/no-store.
- Android gateway must still use the same guarded backend endpoint.
- Korean Hangul names remain searchable; stable ordering prevents jitter.

## Tasks
- [x] RED: repository unit tests for literal metacharacters, bounded Unicode and owner parameter.
- [x] GREEN: normalize, bound, escape LIKE, parameterize, stable order in `wallet.repository.ts`.
- [x] RED: BFF route tests for guest/short/long/private cache/valid forwarding.
- [x] GREEN: BFF validation and private/no-store; modal skips invalid length.
- [x] Verify focused tests, changed-file lint, typecheck, build, full unit suites and real PostgreSQL read-only pattern query.
- [ ] Full lint, dependency audit, exact-SHA CI, authenticated Test E2E and release gates (blocked).
- [ ] Record SHA, branch/PR/CI status, privacy and rollback evidence; no merge or deploy without every gate.
