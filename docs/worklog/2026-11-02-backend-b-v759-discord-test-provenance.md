# Backend B v759 — administrator Discord DM test provenance (DRAFT / RELEASE HOLD)

**Date:** 2026-11-02. **Base:** `305d7c7fec2e5fe6d6b3ae67a9fe54a20ba1758b`. **Branch:** `auto/hourly-b-v759-discord-test-truth-20261102-2035`.

## Problem and root cause

`POST /api/v1/admin/discord/test-dm` used production incident alert formatters with invented WLD transfers, jackpot payouts, Treasury shortages, emergency halts, and bank delinquency. Those messages did not carry a mandatory TEST label and could be mistaken for actual operations. The Next BFF also acquired a session CSRF token before checking the request's Origin and elevated administrator console. This is a **P1 safety/authority defect**; it is not evidence that any real transaction occurred.

## Changed contract

- Backend requires existing session, admin role, open console and CSRF guards. Each of six recognized presets now sends exactly one *test-only* Discord DM with `TEST / 실제 발생 아님` and explicit non-incident description, via `sendAdminDirectMessage`; it never calls live incident alert formatters. Unknown presets return HTTP 400. DM API success means Discord accepted the DM request, not user read/delivery, nor actual incident confirmation.
- Next POST `/api/admin/discord/test-dm` requires exact same-origin `Origin`, same-origin Fetch Metadata when provided, and an open backend admin console **before** issuing any CSRF-bearing mutation. The session-bound `mutate()` helper sends the POST; 401/403/503 errors remain fail-closed. Replies are private no-store/noindex. UI identifies each preset as a simulation, not a live financial alert.
- No schema/migration, direct SQL, financial transaction, account balance, ledger, service deployment, or live Discord send changed.

## Evidence and release gate

RED: backend 7 failing cases, frontend 4 failing cases. GREEN: backend 11 passing, frontend 4 passing. Remaining exact-SHA full tests, CI, isolated PostgreSQL, Test and release gates are reported separately; **no PASS is implied for a missing gate**. PR must remain Draft/HOLD until all required gates are certified. No main merge, Test/Production deployment or automation change authorized by this candidate.
