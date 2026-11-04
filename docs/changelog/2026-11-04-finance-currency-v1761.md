# v2026.11.04.1761 — Canonical WLD currency account metadata
- Adds SQL336 to normalize verified legacy W USER_CASH alias to WLD without monetary movement; immutable owner+balance+journal receipts, WLD-only new-account guard, atomic pre/post conservation.
- 2 new source tests RED→GREEN and independent read-only PG verifier. Production alias cohort 2 member accounts, 2,142,022 existing funds.
- Not yet applied to official Test or Production; dependent on complete PR #2705 and real authenticated finance gates.
