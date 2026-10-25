# Daily Quest Ledger Truth Implementation Plan

**Goal:** Show member-only, server-verified daily quest receipts without fabricated earnings and block unverified mint paths.

**Architecture:** Existing authenticated Next server action fetches the NestJS/PostgreSQL ledger-backed status. Browser shows authoritative read-only status, no local reward claims. NestJS controller and repository both reject claim mutation until a tested SECURITY DEFINER payout contract exists.

**Tech Stack:** Next.js React, NestJS, PostgreSQL, Vitest.

**Spec:** P1 verified rewards and fail-closed ledger boundary in `docs/planning/PROJECT_PLAN.md` and `AGENTS.md`.

## Tasks
- [ ] Write backend controller and repository RED tests for unverified claim fail-closed; run RED.
- [ ] Write frontend RED test for no localStorage reward/streak and verified server status; run RED.
- [ ] Implement minimum backend and frontend changes; run GREEN tests.
- [ ] Verify lint/typecheck/build/full tests/DB/security/contracts and official CI on exact SHA; record failures.
- [ ] Re-fetch main and plan mid-run and before any merge; draft PR and keep release HOLD on incomplete gates.
