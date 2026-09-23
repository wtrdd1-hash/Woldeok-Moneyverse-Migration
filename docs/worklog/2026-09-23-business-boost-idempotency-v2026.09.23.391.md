# Development B worklog — v2026.09.23.391

Base: `d7d2f030d23ec083bf7ba3d86d798347e7636b68`
Branch: `auto/hourly-b-business-boost-idempotency-v2026.09.23.391`

Selected gap: `POST /businesses/:id/boost` consumed one inventory entitlement without an idempotency boundary. A timeout followed by a retry could consume a second item and extend/replace the boost again.

Implementation: API DTO requires UUID; service/repository carry it to PostgreSQL; migration 230 introduces a private command receipt and a four-argument `business_apply_boost` with serialized payload-bound replay. Legacy app execution is revoked.

Validation: focused Vitest 1/1 PASS; backend TypeScript PASS; backend build PASS; changed-file ESLint PASS; `git diff --check` PASS. Migration 230 parsed/applied successfully on isolated PostgreSQL 16 with representative prerequisite objects. Full fresh-schema migration was attempted but the repository baseline stopped earlier at migration 029 due an existing role/table-permission setup mismatch, so full real-PostgreSQL suite success is not claimed here.
