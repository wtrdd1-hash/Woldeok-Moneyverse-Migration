# MiniPC operations and Discord bot integration

Update version: **2026.09.12-03**

## Scope

- Recovered the current MiniPC working-tree operations changes onto the latest application `main` without carrying line-ending noise.
- Added the local Discord bot source as a standalone Node.js package under `bot/`.
- Kept Discord credentials environment-only; `DISCORD_BOT_TOKEN` is not committed.
- Aligned the bot package metadata to the repository Apache-2.0 license.
- Added the consent navigation guard and the stock-admin validation changes present on the MiniPC.
- Removed obsolete GitHub MCP feature branches; no MCP branch content is promoted by this workstream.

## Validation

- `git diff --check`
- `npm --prefix bot test`
- root lint, typecheck, test and production build before merge
- GitHub PR CI before merge

## Rollback

Revert the merge commit for this workstream. Runtime secrets and production data are not modified by this source integration.

## Result

- Local bot syntax check passed.
- Root lint passed with pre-existing image optimization warnings only.
- Typecheck passed.
- Database migration parity passed after resolving the merged `126` collision by moving the settlement hardening migration to `178`.
- Backend tests: 822 passed, database-gated tests skipped where the migrator URL was not provided.
- Frontend tests: 537 passed.
- Production build passed.
