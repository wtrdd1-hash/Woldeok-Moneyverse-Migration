# Woldeok Moneyverse Discord Music Bot & Voice Stay Daemon

High-fidelity Discord music bot and 24/7 immortal voice channel stay daemon dedicated to the Woldeok Moneyverse community.

## 🎵 Key Features

1. **Unlimited Track Streaming (`Infinity`)**:
   - Zero duration cutoff; supports 10+ hours sleep streams, lo-fi playlists, and full-length concerts.
2. **Real-Time Volume Control (`/volume 0~200%`)**:
   - Dynamic PCM-Opus transcoding powered by `@discordjs/voice` VolumeTransformer and `@discordjs/opus` with seamless persistence across tracks.
3. **SponsorBlock REST API Integration & On-the-Fly Audio Slicing**:
   - Live query to `https://sponsor.ajay.app` community database.
   - Slices out creator sponsors (`sponsor`), dialogue skits before songs (`music_offtopic`), channel promos (`selfpromo`), and intros/outros using FFmpeg `aselect='not(between(t,start,end))',asetpts=N/SR/TB` filter chains with zero latency.
4. **24/7 Immortal Voice Stay Daemon**:
   - 5-second ultra-fast watchdog and comprehensive `VoiceStateUpdate` event interceptor.
   - Automatically forces the bot back into target voice room within 1 second if dragged or disconnected.
   - Gateway shard auto-reconnect (`ShardResume`) hooks with infinite exponential backoff.
5. **Universal Public Channel Responses**:
   - All slash commands (`/play`, `/queue`, `/nowplaying`, `/skip`, `/volume`) emit public channel messages, allowing all community members to follow the queue and track requests in real-time.

## ⌨️ Slash Commands (8 Commands)

| Command | Option | Description |
| :--- | :--- | :--- |
| `/play` | `query` (Required: Song title or YouTube URL) | Searches YouTube or loads URL into queue and starts playing |
| `/volume` | `level` (Optional: 0~200) | Adjusts live playback volume or checks current level |
| `/skip` | None | Skips current track and begins next track in queue |
| `/pause` | None | Pauses audio playback |
| `/resume` | None | Resumes paused audio playback |
| `/stop` | None | Stops playback and empties queue (voice channel stay remains active) |
| `/queue` | None | Displays current playing track and up to 10 upcoming tracks |
| `/nowplaying` | None | Displays currently playing track embed with live progress and volume |

## ⚙️ Environment Configuration (`.env`)

```env
DISCORD_BOT_TOKEN="your_bot_token_here"
DEVNURT_GUILD_ID="1104015535592701984"
VOICE_CHANNEL_ID="1536572442422550538"
MUSIC_LOG_CHANNEL_ID="1542465347364589609"
NODE_ENV="production"
```

## 🚀 Execution & Testing

```bash
# Run unit tests (4/4 PASS)
npm test

# Launch bot directly
npm start
# or node index.js

# Execute automated QA ads & SponsorBlock audit script
python3 scripts/qa_ads_sponsorblock_verification.py
```

## 🛡️ Systemd Daemon Management

```bash
# Check service status
systemctl status moneyverse-discord-bot.service

# Restart daemon
sudo systemctl restart moneyverse-discord-bot.service

# Stream live journal logs
journalctl -u moneyverse-discord-bot.service -f
```
