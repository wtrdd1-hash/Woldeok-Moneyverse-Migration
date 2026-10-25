# v1061 Implementation plan — Financial literacy integrity

1. Inspect source and PR ownership, confirm authoritative `/stocks` and `/stocks/compare` use `apiOrNull('/api/v1/stocks')` and real server settlement; do not duplicate stock API.
2. RED: write regression asserting no WLD→fiat peg, fake reward, localStorage order, synthetic PER/PBR, and real server-backed destination links; keyboard accessible buttons and explanatory disclaimer.
3. GREEN: replace WLD conversion with explicitly dated/illustrative KRW-only FX example; replace local trade success modal with optional educational navigation, no mutation.
4. Run targeted Vitest, ESLint, TypeScript, full test/CI and security gates at exact HEAD; record failures and hold release.
5. Fetch/review main and plans again before PR; create draft PR with evidence, protect other agents' worktrees, no main or production mutation.
