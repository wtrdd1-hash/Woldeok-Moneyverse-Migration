# Discord Music Bot — v2026.09.15.119

## Summary
Adds guild-scoped YouTube music playback to the existing Woldeok Discord bot while preserving its 24/7 voice-channel watchdog.

## Changes
- Added `/play`, `/skip`, `/stop`, `/pause`, `/resume`, `/queue`, and `/nowplaying` slash commands.
- Added English command metadata with Korean localizations as the second language.
- Added a bounded 50-track queue and configurable maximum track duration (`DISCORD_MUSIC_MAX_TRACK_SECONDS`, default 3 hours).
- Restricted URL playback to HTTPS YouTube hosts and rejected live streams.
- Added `yt-dlp`-backed audio resolution/streaming and Discord voice player integration.
- Added interaction error handling and audio-process cleanup on shutdown.

## Verification
- `node --check bot/index.js`
- `node --check bot/music.js`
- `npm test` in `bot/`

## Release order
Feature branch -> test runtime -> backend/bot health verification -> production promotion.
