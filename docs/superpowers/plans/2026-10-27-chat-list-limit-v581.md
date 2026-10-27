# P1 chat list/search limit validation plan (v581)
1. RED: controller tests for missing, valid and malformed query limits, duplicate query values, overflow, and no service calls on rejected inputs.
2. GREEN: implement one strict bounded decimal parser; use it only in conversation list and recipient search controllers. No silent clamping.
3. Verify unchanged happy path and actor-scoped calls, API/DB/ledger invariants, local and CI gates; document all skipped/failed gates and hold release.
4. Coordinate with existing unmerged chat bigint cursor PR #1465 and frontend recipient search PR #1429. No merge without official Test exact-SHA evidence.
