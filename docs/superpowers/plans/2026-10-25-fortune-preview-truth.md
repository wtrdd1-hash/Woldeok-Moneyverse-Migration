# Verified Fortune Preview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development and superpowers:verification-before-completion.

**Goal:** Replace fake WLD fortune-cookie receipts with a real, authenticated, nonfinancial fortune quote preview on web and Android.

**Architecture:** A read-only GET endpoint returns a server-selected quote and explicit no-reward contract; POST legacy claim returns 503. The Next.js app gateway allows only the exact preview path (not the full engagement group). The web displays success only for a valid server preview, and shows an error on unavailable responses.

**Tech Stack:** NestJS, Next.js, Vitest, existing PostgreSQL ledger/ACL (unchanged).

**Spec:** docs/worklog/2026-10-25-hourly-a-fortune-preview-0825.md

## Global Constraints
- Do not edit applied migrations, financial ledger or any other agent worktree.
- No fake WLD, quota, persisted affection, or daily claim receipts.
- Private no-store, session/consent guards, and least-privilege unchanged.
- No merge or deployment without exact-SHA official Test and security PASS.

## Review Focus
- Unauthenticated access must not expose member preview.
- Legacy POST must never return successful reward.
- Gateway must not expose arbitrary engagement write endpoints.
- API failures must not produce quote or WLD success UI.
- Preview must not emit a wallet-updated event.

### Task 1 — Backend authority
- [ ] Add failing unit test for preview shape and legacy 503; verify RED.
- [ ] Implement GET preview and retired POST; verify GREEN.

### Task 2 — Browser and Android
- [ ] Add failing tests for exact-path app gateway and web success/failure truth; verify RED.
- [ ] Implement narrow app gateway and quote-only frontend; verify GREEN.

### Task 3 — Verification and release decision
- [ ] Run focused + full gates, isolated PostgreSQL negative ACL, build, security, accessibility and SEO checks.
- [ ] Recheck remote main, document SHA and CI, open Draft PR; HOLD until all gates pass.
