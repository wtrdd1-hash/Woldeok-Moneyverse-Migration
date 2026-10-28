# Admin Backup Inventory Evidence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Steps use checkbox tracking.

**Goal:** Replace misleading admin backup claims with an actual admin-authorized, read-only local-file inventory that explicitly cannot attest remote copy or restoration.

**Architecture:** NestJS backup controller enforces admin guard, labels filesystem observations PENDING, and disables an unverified spawn-only trigger. Next.js private/no-store gateway validates and sanitizes the inventory. Responsive admin dashboard displays unknown/unverified states without invented defaults.

**Tech Stack:** NestJS, Next.js App Router, TypeScript, Vitest.

- [x] Inspect current API, backend guard, UI and competing PRs.
- [x] Write failing backend and frontend tests; capture RED.
- [x] Implement minimum backend ACL, no-execution hold, gateway and UI.
- [x] Re-run focused tests (frontend 6, backend 2).
- [ ] Run full build/lint/typecheck/tests/security/real PostgreSQL/E2E and CI.
- [ ] Re-fetch main and assess integration/hold.

**Release constraint:** The RED test inadvertently executed the old backup script. The local dump artifact and possible upload require operator review; no merge or deployment without independent safety clearance and all gates PASS.
