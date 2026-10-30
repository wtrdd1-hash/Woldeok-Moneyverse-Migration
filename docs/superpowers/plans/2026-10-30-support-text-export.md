# Owner-Private Support Text Export Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans and test-driven-development, verify each step before claiming completion.

**Goal:** Let a signed-in member download up to 500 of their own support messages as a readable UTF-8 text transcript, with an explicit truncation warning.

**Architecture:** Reuse the existing owner-scoped `support_thread_messages` PostgreSQL SECURITY DEFINER function through `SupportRepository.messages(actor, thread, 500)`. Add a NestJS read-only JSON text representation endpoint, a same-origin Next.js authenticated text download route and link, and force Android gateway responses to private/no-store/noindex even when upstream is misconfigured. No schema change or direct table grants.

**Tech Stack:** NestJS, Next.js App Router, TypeScript, Vitest, PostgreSQL 17.

## Tasks
1. Add backend tests: auth guards retained, owner actor used, 500-message bound, text formatting escapes control bytes, truncation notice. Run RED.
2. Add backend formatter and endpoint with cache/privacy headers; run GREEN and focused tests.
3. Add frontend route and UI tests for authentication, malformed IDs, wrong thread ID, privacy headers, download filename, truncation warning; run RED then implement and GREEN.
4. Add Android app-api test for upstream public cache headers and noindex; run RED, implement minimal gateway fix, GREEN.
5. Run changed lint, typecheck, build, focused/full tests, real isolated PostgreSQL owner/foreign-owner checks, security audit and app-api contract check. Re-fetch main and plans before PR.
6. Document before/mid/end evidence, branch counts, SHA, failures, official Test/Production/rollback status. Publish Draft/HOLD PR; no merge/promotion without all gates.

**Acceptance:** No data leak, no direct table access, no PII in URLs, no invented completeness, no cacheable Android responses, zero operational DB writes, no branch deletion, no deployment on FAIL/BLOCKED.
