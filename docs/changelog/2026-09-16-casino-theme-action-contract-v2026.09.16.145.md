# Internal Update — v2026.09.16.145

- Scope: casino frontend/backend contract audit and optimization review.
- Root cause fixed: themed forms used `number`/`parity`, while `playDiceNumber` and `playDiceParity` consume `choice`.
- Affected UI: slots, high/low, wheel, treasure, gems.
- Backend audit: server-authoritative settlement, input validation, idempotency and database-owned payout/RNG remain intact; no backend code change required for this defect.
- Planning rechecked during work: `docs/planning/CASINO_GAME_SYSTEM_SPEC.md` still requires server-authoritative results, protective limits and receipt-derived animation.
- Tests: contract build PASS; targeted casino frontend 40/40 PASS; frontend typecheck PASS; targeted ESLint PASS.
