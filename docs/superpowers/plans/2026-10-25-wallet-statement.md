# Recent Wallet CSV Statement Implementation Plan

> **For agentic workers:** Use TDD RED-GREEN-REFACTOR, isolated worktree, verification before completion.

**Goal:** Authenticated users can download their own latest up-to-50 WLD ledger entries as spreadsheet-safe CSV on web and Android app-api without ledger writes.

**Architecture:** Reuse existing owner-scoped PostgreSQL read projection via WalletService, add CSV serialization that rejects noncanonical WLD amounts and neutralizes formula injection, expose guarded Nest GET with private/no-store and attachment headers. Existing app-api proxy forwards CSV without JSON conversion. Activity page links to the same-origin app gateway.

**Tech Stack:** NestJS, TypeScript, PostgreSQL, Next.js, Vitest.

1. [x] Write backend serializer and route tests (RED), including injection, precision, bounds, unauthenticated denial.
2. [x] Implement serializer and controller endpoint (GREEN), no new DB migrations.
3. [x] Write Android app-api passthrough regression test (existing proxy already supports CSV).
4. [x] Add member activity download CTA and focused frontend regression.
5. [x] Recheck latest main and integrated EN/KO planning mid/final; verify focused/full tests and isolated PG permissions; Draft PR/HOLD because full frontend/security/official Test gates fail.
