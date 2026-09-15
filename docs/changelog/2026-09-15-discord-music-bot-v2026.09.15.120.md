# Discord Music Bot — v2026.09.15.120

## Summary
Promotes the music candidate on top of the latest `main`, verifies the persistent voice-channel policy for channel `1536572442422550538`, and resets/re-registers guild music commands without deleting the existing global economy/admin command set.

## Changes
- Preserved boot-time auto-join, `VoiceStateUpdate` immediate rejoin, connection-state recovery, and the 30-second watchdog.
- Reset guild-scoped music slash commands and re-registered `/play`, `/skip`, `/stop`, `/pause`, `/resume`, `/queue`, and `/nowplaying` with Korean localizations.
- Corrected bot backend health probing from obsolete `/api/version` to the live `/health` endpoint.
- Kept the target voice channel configurable through `DISCORD_VOICE_CHANNEL_ID`, defaulting to `1536572442422550538`.

## Verification
- Isolated candidate `npm ci`: passed, 0 vulnerabilities.
- `npm test`, `node --check bot/index.js`, `node --check bot/music.js`: passed.
- Music module smoke: 7 commands loaded; YouTube allowlist validation passed.
- Production backend `/health`: HTTP 200.
- Running bot service confirmed connected to voice channel `1536572442422550538`.

## Release order
Feature branch -> isolated test runtime -> backend/bot health verification -> `main` -> production bot restart -> post-deploy voice/music smoke test.
