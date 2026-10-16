# Changelog — v2026.10.17.750

**English canonical** | [한국어](2026-10-17-pvp-ledger-hold-v750.ko.md)
**Type:** Financial P0 safety containment candidate — application code and UI, not a Production deployment.

- Backend PvP wager room creation and joining/settlement now fail closed with Nest HTTP 503 `PVP_LEDGER_SETTLEMENT_UNCERTIFIED` before SQL, irrespective of environment feature flags.
- Historical room lists, completed battles and creator room cancellation still available.
- PvP modal displays honest remediation notice and disabled creation/join controls.
- Added four financial-negative backend regressions and one frontend UX state test; complete backend/frontend unit suites and both builds passed locally, with **396 DB tests skipped**.
- Existing finance role/grant/ledger opening issues and exact-source Test/Production promotion gate remain **BLOCKED**. No DB/ledger/grant, Test or Production changes.
