# Wallet Pocket History — A1325 Implementation Plan

## Objective
Add a truthful, bounded, owner-scoped **cash versus bank** transaction history view. A cash↔bank internal transfer must appear in both pocket histories with its signed pocket delta, even if total net movement is zero. Apply the pocket filter in PostgreSQL **before** the 50-row cap; do not infer history from only the newest 50 all-pocket transactions. Preserve existing wallet overview and existing draft branches.

## Task 1 — TDD RED: contract and repository
1. Add repository tests proving validated pocket (`cash` or `bank`), owner-bound SQL parameters, filter-before-limit and signed exact WLD delta.
2. Add service tests for invalid input and consistent WLD normalization.
3. Add backend controller route/auth tests for `GET /api/v1/wallet/transactions?pocket=cash|bank&recent=1..50`.
4. Run focused tests and record RED.

## Task 2 — Backend + database read model
1. Add a read-only owner-filtered query returning only nonzero selected-pocket movements, ordered newest first, bounded to 1..50.
2. Reuse existing wallet transaction normalization; never cast amounts to JS Number, write ledger, or change grants/migrations.
3. Use existing SessionGuard/AuthenticatedGuard/ConsentGuard/CsrfGuard on the new GET endpoint.

## Task 3 — Frontend + Android app-api
1. Add cash/bank/all accessible filter links to `/wallet/activity`, reflecting query parameter and showing selected pocket deltas, including net-zero internal movements.
2. Add tests for filter links, exact signed pocket values, empty/error/invalid states.
3. Ensure Android `/app-api/v1/wallet/transactions` is authenticated, cache-private, and contract-visible; test gateway route.

## Task 4 — Verification and release decision
1. Focused RED→GREEN, full lint/typecheck/unit/build/API-contract, audit, isolated read-only PostgreSQL owner query and accessibility/SEO checks.
2. Refresh latest main and mutable plans at mid and pre-integration; record exact SHA and CI evidence.
3. Only merge after every required gate PASS. Otherwise Draft PR/HOLD; no Test/Production/DB mutation, no other branch deletion.
