# Internal worklog — Discord command synchronization v2026.09.17.194

## Trigger
The running bot reported seven music commands as registered, but the implementation only fetched existing guild commands and edited or created the seven desired names. That path did not perform the documented guild-command reset.

## Runtime evidence before change
- `moneyverse-discord-bot.service` was active and running from `/home/debian/Woldeok-Moneyverse-Migration/bot`.
- Bot login succeeded as the production bot account.
- Startup log reported seven guild music commands registered.
- Voice connection to channel `1536572442422550538` reached Ready and later recovered successfully.
- Local bot file Git blob IDs matched the current GitHub `main` bot files.

## Root cause and fix
`MusicManager.registerCommands()` used fetch/edit/create semantics. This preserved unrelated or stale guild-scoped command entries. The implementation now uses `guild.commands.set(MUSIC_COMMANDS)`, which replaces the guild command collection with the exact supported music command set while leaving global application commands untouched.

## Verification
- Branch: `fix/discord-command-sync-v2026.09.17.194`.
- Local isolated dependency install: passed, 0 vulnerabilities.
- Bot syntax checks: passed.
- New regression test: passed 1/1.
- Release must remain Test-first; production is not considered complete until Test backend health and post-restart Discord command/voice smoke checks pass.
