# v2026.10.01.500 App/Site Channel Contract Worklog

## Start
- Task: v498 Task 2 — add the canonical App/Site channel route manifest.
- Base: `87ebcf0330112d832513bfba00eb5de6f9c65c5f`.
- Latest checked `origin/main`: `2bad12eb290cba6b98d08604cd6b1274243e1a4f`.
- Branch: `feat/channel-contract-v2026.10.01.500`.
- Current native inventory source: `docs/mobile-api-contract.json`, 179 documented App API v1 endpoints.
- Current browser drift: production web source still contains direct `/app-api/v1/**` calls for chat/support/game-clock/dopamine plus developer-portal examples.
- Ruling: `pathTemplate` includes the public channel prefix, so App and Site contracts are separate even when they map to the same downstream domain command. This preserves the v497 requirement that both channels may share one Economy Core without sharing one public BFF contract.
- Scope: contract/inventory only. No BFF runtime route is added in Task 2.

## Mid-work
- Correct TDD RED: `channel-api.test.ts` failed because `./channel-api` did not exist. A first environment-only failure from missing worktree dependencies was resolved with `pnpm install --frozen-lockfile`, then the intended RED was re-run and observed.
- GREEN: manifest invariant suite passes with APP=179, SITE=23, total=202.
- Checker TDD RED: `check-channel-api-contract.test.mjs` failed because the checker module did not exist; after implementation all 3 checker unit tests pass.
- Site candidate audit found stale developer-portal examples (`bank/products`, `casino/stats`, `work/execute`, `streams/market-ticks`, generic stock detail) that are not current backend contracts; these were deliberately not promoted into the canonical manifest.
- Mid-work `origin/main=2bad12eb290cba6b98d08604cd6b1274243e1a4f`.

## Completion evidence
- `pnpm --filter @moneyverse/contract test`: 5 files / 40 tests pass.
- `node --test scripts/check-channel-api-contract.test.mjs`: 3/3 pass.
- `pnpm api:channel:check`: PASS, APP=179 SITE=23 LIVE=0 TARGET=202.
- `pnpm typecheck`: exit 0 across contract/database/backend/frontend.
- Changed TypeScript files: ESLint errors 0; `.mjs` checker files are ignored by the repository ESLint configuration.
- Full root `pnpm test` reaches and passes the new channel checks, then fails pre-existing `packages/database/test/migration-parity.test.ts` because latest main lacks `packages/database/init/000-create-app-role.sh` while the test expects it.
- Full root lint has pre-existing errors outside this task (13 errors / 430 warnings in the observed run); v500 changed TypeScript files add no lint error.
- No generated mobile-contract artifact drift was produced.
- Task 2 does not activate new public routes; App v2/Site v1 remain TARGET for Task 3.
