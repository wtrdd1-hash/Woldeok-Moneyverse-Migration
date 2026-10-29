# Development C v1119 — Verified administrator support mutations

## BEFORE WORK — 2026-10-28 10:15 KST
- Debian 13.6 miniPC system status: seven services active; development PostgreSQL connected (read-only status).
- Baseline `a28bed9aa40ff74d492824ae12892a7d52132fdd` fetched from origin/main. Independent `auto/hourly-c-support-receipt-v1119-20261028-1015` worktree.
- Reviewed AGENTS, README, README/README.ko.md, canonical PROJECT_PLAN and Korean companion, release guide, open PR #1664/#1667/#1668/#1670, QA v1337 and P0 workflow integrity incident #1663. No overlap: A privacy filters, B NPC orders, C admin IP, planning support unread receipts.
- Source defect: admin support actions return void for malformed inputs and never validate POST/PUT receipts. Client immediately displays success after action resolution. Backend already returns `message` or `status`, and PostgreSQL repository exposes authenticated readbacks. This is a P1 false-success operator workflow, not a UI-only feature.
- Plan: RED receipt tests; enforce UUID/DTO/response/readback; preserve CSRF, admin guard, noindex and mobile controls; validate full exact-SHA gates; HOLD on any failures. No schema/finance change.

## IN PROGRESS
- [x] RED tests demonstrated 7/10 failures before changes; new idempotency and accessibility tests also failed before implementation.
- [x] Validate DB-backed reply receipt, CSRF and status receipt; verify status using DB-backed NestJS mutation receipt. Avoid reply history readback: SQL migration 196 returns oldest 500 messages, which would falsely reject successful replies in long threads. Preserve client idempotency key across uncertain acknowledgements.
- [x] GREEN 17/17 focused tests. First typecheck found Promise<object> incompatible with HTML form action; corrected to Promise<void>. Full gates pending.
- [ ] Midpoint and final origin/main/plan checks; PR and release gate decision.

## FINISHED
- Pending exact-SHA gates and PR release decision.

### Midpoint correction (10:30 KST)
- Existing `actions-receipts.test.ts` was discovered by full root test. Its matching-status test failed because the added inbox readback was not part of the existing contract. Source inspection shows `admin_support_threads` is capped at 100 and sorted by status; a successful `resolved` mutation can disappear from the inbox. Removed this false-negative readback and rely on NestJS status receipt emitted only after PostgreSQL `admin_support_set_status` returns true. Added a failing regression for the bounded-inbox case, then fixed it.
- Isolated PostgreSQL 17.11 full migrations through 290 PASS; app-role direct support table INSERT denied; DB reply idempotency and status update PASS; DB-backed Backend 2,513 PASS / 70 SKIP. Temporary container removed.
- Prior SHA root test failed on unrelated blog editorial test and this readback regression. Final SHA must rerun all gates.
