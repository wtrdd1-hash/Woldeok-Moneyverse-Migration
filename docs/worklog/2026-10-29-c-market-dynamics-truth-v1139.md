# C v1139 — Admin stock-market dynamics evidence (RELEASE HOLD)
## Before work — 2026-10-29 01:11 KST
- Source main: `35971c600f25869c96f1c666d4b9f58927202730`; branch `auto/hourly-c-market-dynamics-truth-v1139-20261029-0111`; separate worktree.
- Read AGENTS.md, README, README/README.ko.md, English and Korean living plans; reviewed active PRs including C #1762, A #1761, B #1760 and prior QA. No duplicate market-dynamics PR found.
- P1 verified gap: the existing frontend `parseMarketDynamics` already rejects NULL/malformed/negative metrics, so they **cannot** become fake zero/NaN on the page. However it accepts contradictory market-wide trends across rows and extremely large numeric basis-point strings (18 digits) that the UI converts to imprecise Number; extreme price ratios can also overflow. SQL migration 124 LEFT JOIN explains why backend type declarations must be nullable, even though the frontend parser rejects missing rows.
- Safety: no finance writes, no schema changes, no shared DB mutations, no Test/Production deployment.
## In progress
- [x] RED suite: missing module failure reproduced; five focused tests now PASS.
- [x] Corrected backend nullable SQL result type (frontend validated shape remains non-null); bounded numeric metrics and cross-row market regime consistency in the existing parser, plus overflow-safe formatting and accessible warning.
- [ ] Focused tests and full gates; isolated real PostgreSQL only.
## Midpoint — 2026-10-29 01:14 KST
- Re-fetched origin/main: unchanged at 35971c600. SQL migration 124 LEFT JOIN explains NULL evidence; no SQL or shared DB changes.
- Focused Vitest 5/5 PASS after initial RED. Additional parser RED reproduced contradictory market regime acceptance (1 failure); corrected existing validator instead of duplicating its NULL checks.
## Finished
- Pending verification. PR must remain DRAFT/HOLD until all mandatory gates pass.
