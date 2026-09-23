# v2026.09.23.397 — Mandatory feature/API implementation parity

- Raised authoritative EN/KO `PROJECT_PLAN` and integrated planning ledger to v397.
- Added a P0 rule that every server-backed or security-sensitive feature must implement the required API in the same workstream.
- Declared UI-only delivery incomplete unless the feature is explicitly client-only.
- Required complete API contracts, web/mobile parity, security controls, persistence/failure semantics, API tests, contract checks, and exact-SHA client-to-API E2E verification.
- Production promotion is blocked when required backend/API implementation, tests, or documentation are missing.
- Planning/docs only; no claim that all historical features already have complete API coverage.
