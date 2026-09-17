# Discord guild command reset — v2026.09.17.194

## Summary
Fixes the Discord music-command reset path so the guild command surface is replaced atomically with the seven supported music commands instead of only editing or creating matching entries. Application-global commands are not modified.

## Changes
- Replace the guild command collection with `/play`, `/skip`, `/stop`, `/pause`, `/resume`, `/queue`, and `/nowplaying` in one `guild.commands.set(...)` operation.
- Remove stale guild-scoped commands as part of that replacement.
- Keep English as the primary command names and Korean as the second-language localization.
- Add a regression test proving the exact seven-command payload is used.
- Expand the bot test script to syntax-check both bot modules and run the command-sync regression test.

## Validation
- `npm ci`: passed, 0 vulnerabilities.
- `npm test`: passed; syntax checks passed and regression test 1/1 passed.
- Production pre-change observation: bot service active, login successful, seven music commands reported registered, and target voice channel connection healthy.

## Release sequence
Feature branch -> isolated validation/Test candidate -> Test backend health check -> merge to `main` -> production bot restart -> command/voice smoke verification.
