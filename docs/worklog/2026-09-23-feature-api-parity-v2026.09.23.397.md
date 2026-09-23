# Worklog — v2026.09.23.397 feature/API parity

## Baseline
- Remote main before edit: `0e46f1eac272c42aa929947b79c0b0d2ccbd5454`.
- Authoritative planning version before edit: v396.
- Dedicated branch: `docs/v2026.09.23.397-api-parity`.

## Decision
Every implemented feature that depends on server state, persistence, authorization, backend business logic, automation, or shared/cross-client behavior must ship with its API in the same workstream. UI-only implementation is incomplete unless explicitly client-only.

## Acceptance
Completion requires API contract, authorization/security, persistence/failure semantics, automated tests, contract/schema verification, documentation parity, and exact-candidate client-to-API E2E evidence.

## Evidence boundary
Documentation/planning only. No runtime implementation or deployment is claimed by this change.
