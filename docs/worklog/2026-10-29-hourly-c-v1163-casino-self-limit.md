# C v1163 — Casino self-limit persistence verification

## Before work — 2026-10-29 17:45 KST
- Host: Debian 13.6 miniPC; seven services active, database connected; root disk 74% used.
- Base origin/main: 9ebc5613845ba2e8179a0051e86db996593c8a19; existing main checkout dirty, never modified.
- Read AGENTS.md, README.md, README/README.ko.md, English and Korean living plans, current A/B/C/QA PRs and CI. Open PR inventory has no casino self-limit persistence fix.
- P1 verified from source: both `/arcade` and `/casino` actions treat a typed PUT response as proof of a saved protective limit, while NestJS echoes the submitted DTO after a DB call. A member-specific GET `/api/v1/casino/self-limit` already reads the authoritative SQL function. Success may therefore be shown without readback proof.
- Scope: validate PUT response, GET the authenticated member's persisted values, compare both caps and optional lock instant; preserve CSRF and existing responsive accessible forms. Fail closed on ambiguous evidence; no DB/schema changes.
- TDD: add failing receipt-verification tests first, then implement shared helper and use it from both server actions. Validate isolated PostgreSQL backend contract, CI and exact SHA gates; do not merge or release unless all pass.

## In progress — 2026-10-29 17:45 KST
- TDD RED: `vitest` failed on missing `casino-self-limit-proof` module (after clean offline dependency installation).
- GREEN: 19 focused tests pass (11 proof/contract cases, 8 real server-action integration mocks covering both `/arcade` and `/casino`).
- Both actions now require a valid PUT receipt plus authenticated GET readback, matching canonical integer caps and exact optional lock instant. Missing/contradictory readback shows explicit unknown-save-state recovery, not success.
- Existing NestJS GET is owner-scoped through `member_casino_self_limit`; no schema, financial or shared DB changes.
- Pending complete gates and PR evidence.

## Finished
- Pending.
