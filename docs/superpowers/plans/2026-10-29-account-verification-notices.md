# Account Verification Notices Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prevent forged or stale account security success banners from untrusted URL query parameters.

**Architecture:** Reuse existing owner-scoped backend identity and active-session read models. A pure verifier maps untrusted query parameters and validated readback into verified/unverified notices; the server-rendered account page uses the verifier to render accessible statuses.

**Tech Stack:** Next.js App Router, TypeScript, Vitest, NestJS, PostgreSQL SECURITY DEFINER owner-scoped read functions.

**Spec:** `docs/worklog/2026-10-29-hourly-c-v1168.en.md`

## Global Constraints
- No new migrations, no finance writes, no unverified success.
- Preserve mobile responsive layout, keyboard navigation, `robots: noindex`, and readable screen-reader notices.
- No main mutation; do not merge or deploy unless every gate is proven PASS.

## Tasks
- [x] Add failing Vitest cases for untrusted query, stale session, malformed identity/session responses, verified owner data, and source wiring.
- [x] Run RED test and capture failure.
- [x] Implement smallest pure verifier and account page readback wiring.
- [x] Run GREEN test, existing account/backend contract tests and lint/typecheck/build gates.
- [ ] Re-fetch main and plan, document SHA, failures and release hold; push only independent branch.
