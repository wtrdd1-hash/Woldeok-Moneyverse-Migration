# C v1139 — Admin stock-market dynamics evidence (RELEASE HOLD)
## Before work — 2026-10-29 01:11 KST
- Source main: `35971c600f25869c96f1c666d4b9f58927202730`; branch `auto/hourly-c-market-dynamics-truth-v1139-20261029-0111`; separate worktree.
- Read AGENTS.md, README, README/README.ko.md, English and Korean living plans; reviewed active PRs including C #1762, A #1761, B #1760 and prior QA. No duplicate market-dynamics PR found.
- P1: SQL migration 124 uses LEFT JOIN on dynamics and scalar market regime lookup; missing dynamics/regime yields NULL, while backend/frontend type declarations claim non-null strings. Admin UI turns NULL volatility into `0.0 %/일` and invalid values into `NaN %/일`, and uses first stock's market-wide trend without checking consistency.
- Safety: no finance writes, no schema changes, no shared DB mutations, no Test/Production deployment.
## In progress
- [x] RED suite: missing module failure reproduced; five focused tests now PASS.
- [x] Corrected backend/frontend nullable API type declarations; added explicit unknown metric formatting, market-wide consistency check, accessible warning.
- [ ] Focused tests and full gates; isolated real PostgreSQL only.
## Midpoint — 2026-10-29 01:14 KST
- Re-fetched origin/main: unchanged at 35971c600. SQL migration 124 LEFT JOIN explains NULL evidence; no SQL or shared DB changes.
- Focused Vitest 5/5 PASS after RED.
## Finished
- Pending verification. PR must remain DRAFT/HOLD until all mandatory gates pass.
