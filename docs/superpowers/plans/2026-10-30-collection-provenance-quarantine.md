# Collection provenance quarantine — bounded P0 design and implementation plan

## Problem and decision
The authenticated Collections GET currently seeds four claimed ownership badges on first read, without a verified issuance event. The web client additionally invents four default badges and falls back to localStorage after failed reads, falsely presenting ownership. Existing records cannot be treated as verified solely because they exist in `user_collections`. No destructive cleanup or unreviewed migration is permitted.

## Design (fail closed, read-only)
1. Backend list GET performs only owner-scoped SQL SELECT, never INSERT. The API returns an empty `pieces` verified-ownership list and an `unverifiedRecords` count of existing rows, with `verificationStatus: 'unavailable'` until a separately approved issuance/attestation model exists. This is intentionally a temporary ownership-display HOLD, not a claim that records were deleted.
2. Disable edit/progression mutations on the unverified collection surface (HTTP 503, no DB calls). Curation GET must not create progress rows and returns `status: null` with verification status unavailable.
3. Web renders loading, no-verified-ownership and error states without fabricated defaults or localStorage ownership. No shareable fabricated showcase URL or optimistic local-only ownership mutations.
4. Android app-api preserves authentication and forwards the same fail-closed JSON, forces private/no-store/noindex on all collection responses including errors.
5. Preserve historical rows, other users' data, existing migrations/checksums and ledger. No production writes. Test on isolated PostgreSQL and ensure no implicit grants.

## Execution and checks
- RED: backend repository/service/controller and frontend/app-api tests fail against current main; capture logs.
- GREEN: minimal backend, web, gateway implementation. Add regression assertions for empty/invalid/unavailable responses, owner scoping and no mutation.
- VERIFY: targeted tests, lint/typecheck/build, isolated PostgreSQL, API contract, security, accessibility/SEO, full CI and official exact-SHA Test. HOLD merge/deploy unless every mandatory gate passes.
- REVIEW: re-fetch main/plans before integration, inspect diff, document QA and release decision, publish Draft PR if blocked.

### DB privilege correction (07:02 KST)
Isolated main migrations prove the app role cannot SELECT `user_collections`. A direct count would 42501. Migration `306-collection-unverified-owner-count.sql` adds an owner-parameterized SECURITY DEFINER text count with pinned search path, explicit EXECUTE grant only and no table access. This is the only new schema object; applied SQL is untouched. Real PostgreSQL must prove two owners' different counts, zero for a third, denied app table DML, and no implicit badge grants.
