# v540 — Fail closed on fabricated mint/burn monetary evidence

## Problem and scope

`MintService` had an in-memory genesis mint batch (500,000,000 WLD) and a fake burn certificate (1,250,000 WLD), exposed as audited monetary facts. Mint creation, acceptance and burn mutated process-local arrays and emitted success messages without DB-owned settlement. `CentralBankService` further multiplied these unverified amounts into M0/M1/M2. No authoritative immutable ledger, verified burn proof, transaction identity or cross-process idempotency supported those claims.

## Decision

Until ledger-backed DB functions and independent certificate verification are implemented, return HTTP 503 `MINT_LEDGER_EVIDENCE_UNAVAILABLE` for every mint/burn/certificate/supply read and write path, including central-bank acceptance and M0/M1/M2 aggregation. Keep unrelated rate and reserve policy APIs unchanged. Preserve existing route and DTO shapes, authorization and CSRF guards, and use `Cache-Control: no-store` on affected endpoints. Do not write any migration or touch existing money balances.

## TDD implementation stages

1. Write boundary tests for mint issuance, burn, acceptance, fabricated genesis reads, fake certificate reads and central-bank aggregate bypass; run RED.
2. Remove synthetic mint/burn state and success alerts; add explicit 503 hold. Protect central-bank acceptance and aggregates independently even if a mock MintService supplies fake records.
3. Update legacy tests to the fail-closed contract, add no-store headers, and run focused tests, Backend full tests, typecheck, lint, build, security scans and broader gates.
4. Record release blockers and create a Draft PR. No main merge, Test deployment or Production promotion until all required gates pass.

## Restoration contract (not implemented)

DB-owned `SECURITY DEFINER` functions must enforce role/actor, idempotency, ledger-backed issuance/burn, irreversible transaction evidence, bounded owner/admin reads and atomic audit/outbox; never use app-role direct ledger DML or fake SHA-256 strings as signatures. Independent isolated PostgreSQL and exact-SHA Test E2E must prove this before unblocking.
