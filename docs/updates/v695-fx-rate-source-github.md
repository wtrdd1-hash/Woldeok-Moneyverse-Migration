# Backend B v695 — Fail closed when FX spot evidence is unavailable (Draft / Release HOLD)

**Scope:** The public FX portal and forward-rate / early-warning read paths must not turn an absent reserve row into an invented 1350 WLD spot quote. `FxRepository.getLatestRate` now rejects missing, non-numeric, non-finite, zero and negative rates with HTTP 503 (`ServiceUnavailableException`). Missing reserve-master rows now raise 503 instead of a generic 500. A valid positive finite observed rate is passed through unchanged.

**Source/contract:** `backend/src/admin/fx/fx.repository.ts`. No new endpoint, DB schema, migration, authorization grant, ledger mutation, FX trade or WLD change. The existing 1350 WLD **policy anchor** in early-warning calculations is unchanged; it is not used as a fallback market observation.

**Regression:** Unit tests cover absent/malformed rates, valid rate, forward/EWS refusal, missing reserves; an actual Nest HTTP test asserts `GET /api/v1/fx/portal` responds 503 with no fabricated quote. TDD baseline was 11 FAIL / 1 PASS; candidate focused tests pass. See PR for full exact-SHA gate results.

**Release HOLD:** This is a containment fix, **not** a repair for Test DB migration divergence or FX table grants (#2111). Isolated PostgreSQL grants intentionally deny direct app SELECT on FX reserves/rates; restoring a read path requires a reviewed SECURITY DEFINER boundary, not a broad GRANT. Official Test exact-SHA authenticated E2E, complete CI and independent restore must pass before any merge or Production promotion. Other marketplace/auction P0 work remains owned by A/C (#2191, #2181).
