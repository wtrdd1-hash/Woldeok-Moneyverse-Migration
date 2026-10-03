# API Security Hardening v2026.10.01.503 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans and test-driven-development task-by-task.

**Goal:** Tighten the browser-to-internal-API trust boundary without changing economy semantics or database privileges.

**Architecture:** Keep NestJS private and protected by the internal token. Extract a deterministic CORS policy so Production accepts only the configured public origin, development may use loopback origins, and trusted edge identity headers are never browser-authorized.

**Tech Stack:** NestJS 11, Express 5, TypeScript 6, Vitest.

**Spec:** `docs/planning/SECURITY_MASTER_PLAN.md`

## Global Constraints
- Deny by default; no client-derived authorization.
- No secrets in client or repository.
- Preserve BFF-only backend architecture and PostgreSQL authority.
- English canonical documentation with Korean companion.
- Exact-SHA Test verification before Production.

## Review Focus
- Production localhost Origin must be rejected.
- Canonical Production Origin must be accepted.
- Development loopback Origins must remain usable.
- Browser CORS must not authorize `CF-Connecting-IP`.
- Requests without Origin must remain valid for server-to-server callers.

### Task 1: CORS trust-boundary policy
**Files:** Create `backend/src/security/cors-policy.ts`, `backend/src/security/cors-policy.test.ts`; modify `backend/src/main.ts`.
- [ ] Write failing policy tests.
- [ ] Run tests and confirm RED.
- [ ] Implement minimal policy and wire bootstrap.
- [ ] Run focused tests and confirm GREEN.

### Task 2: Verification and release evidence
**Files:** update worklog; create internal/GitHub update notes in English/Korean.
- [ ] Refresh `origin/main` and re-read integrated/security plans.
- [ ] Run lint, typecheck, backend tests, build, secret/security checks.
- [ ] Commit/push branch and create PR.
- [ ] Deploy exact candidate to isolated Test; verify backend readiness and public Test smoke.
- [ ] Reconcile latest main before merge/promotion; preserve zero-downtime gate.
