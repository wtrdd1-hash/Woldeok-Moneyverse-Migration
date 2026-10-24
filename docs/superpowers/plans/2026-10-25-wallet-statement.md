# Recent Wallet CSV Statement Implementation Plan

> **For agentic workers:** Use TDD RED-GREEN-REFACTOR, isolated worktree, verification before completion.

**Goal:** Authenticated users can download their own latest up-to-50 WLD ledger entries as spreadsheet-safe CSV on web and Android app-api without ledger writes.

**Architecture:** Reuse existing owner-scoped PostgreSQL read projection via WalletService, add CSV serialization that rejects noncanonical WLD amounts and neutralizes formula injection, expose guarded Nest GET with private/no-store and attachment headers. Existing app-api proxy forwards CSV without JSON conversion. Activity page links to the same-origin app gateway.

**Tech Stack:** NestJS, TypeScript, PostgreSQL, Next.js, Vitest.

1. [ ] Write backend serializer and route tests (RED), including injection, precision, bounds, unauthenticated denial.
2. [ ] Implement serializer and controller endpoint (GREEN), no new DB migrations.
3. [ ] Write Android app-api passthrough regression test (RED) then implement any required gateway fixes.
4. [ ] Add member activity download CTA and focused frontend regression.
5. [ ] Recheck latest main and integrated EN/KO planning mid/final; verify focused/full test and real isolated PG permissions, then PR/HOLD or gated merge.
