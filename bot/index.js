import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  Events,
  ActivityType
} from 'discord.js';
import {
  joinVoiceChannel,
  getVoiceConnection,
  VoiceConnectionStatus,
  entersState,
} from '@discordjs/voice';
import http from 'node:http';
import { MusicManager } from './music.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const LOG_CHANNEL_ID = process.env.DISCORD_LOG_CHANNEL_ID || '1542465347364589609';
const ADMIN_USER_ID = process.env.DISCORD_ADMIN_ALERT_USER_ID || '886478189520637992';
const VOICE_GUILD_ID = process.env.DISCORD_VOICE_GUILD_ID || '1104015535592701984';
const VOICE_CHANNEL_ID = process.env.DISCORD_VOICE_CHANNEL_ID || '1536572442422550538';
const MUSIC_MAX_TRACK_SECONDS = process.env.DISCORD_MUSIC_MAX_TRACK_SECONDS
  ? Number(process.env.DISCORD_MUSIC_MAX_TRACK_SECONDS)
  : Infinity;

if (!BOT_TOKEN) {
  console.error('[CRITICAL] DISCORD_BOT_TOKEN is not defined in environment variables.');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages
  ]
});

let isReconnecting = false;
let watchdogInterval = null;
let healthCheckInterval = null;

const music = new MusicManager({
  guildId: VOICE_GUILD_ID,
  voiceChannelId: VOICE_CHANNEL_ID,
  maxTrackSeconds: Number.isFinite(MUSIC_MAX_TRACK_SECONDS) && MUSIC_MAX_TRACK_SECONDS > 0
    ? MUSIC_MAX_TRACK_SECONDS
    : undefined,
  ensureVoiceConnection,
});

/**
 * 로그 채널에 메시지 또는 임베드 직접 전송
 */
async function sendLog(payload) {
  try {
    const channel = await client.channels.fetch(LOG_CHANNEL_ID).catch(() => null);
    if (!channel) {
      console.warn(`[Log] Log channel ${LOG_CHANNEL_ID} not found or inaccessible.`);
      return;
    }
    if (typeof payload === 'string') {
      await channel.send({ content: payload });
    } else {
      await channel.send(payload);
    }
  } catch (err) {
    console.error('[Log] Failed to send log to Discord channel:', err.message);
  }
}

/**
 * 관리자(886478189520637992)에게 1:1 Direct Message(DM) 전송
 */
async function sendAdminDM(payload) {
  try {
    const user = await client.users.fetch(ADMIN_USER_ID).catch(() => null);
    if (!user) {
      console.warn(`[DM] Admin user ${ADMIN_USER_ID} not found or inaccessible.`);
      return false;
    }
    if (typeof payload === 'string') {
      await user.send({ content: payload });
    } else {
      await user.send(payload);
    }
    console.log(`[DM] Direct message delivered to admin user ${ADMIN_USER_ID}`);
    return true;
  } catch (err) {
    console.error(`[DM] Failed to send direct message to admin user ${ADMIN_USER_ID}:`, err.message);
    return false;
  }
}

/**
 * 음성 채널 연결 및 24/7 상주 보장
 */
async function ensureVoiceConnection(reason = 'Normal') {
  if (isReconnecting) return;
  isReconnecting = true;

  try {
    console.log(`[Voice] Ensuring voice connection to guild ${VOICE_GUILD_ID}, channel ${VOICE_CHANNEL_ID} (Reason: ${reason})`);

    const guild = await client.guilds.fetch(VOICE_GUILD_ID).catch(() => null);
    if (!guild) {
      console.warn(`[Voice] Guild ${VOICE_GUILD_ID} not found in bot's cache.`);
      isReconnecting = false;
      return;
    }

    const channel = await guild.channels.fetch(VOICE_CHANNEL_ID).catch(() => null);
    if (!channel) {
      console.warn(`[Voice] Voice channel ${VOICE_CHANNEL_ID} not found in guild ${VOICE_GUILD_ID}.`);
      isReconnecting = false;
      return;
    }

    const existingConnection = getVoiceConnection(VOICE_GUILD_ID);
    if (existingConnection) {
      if (existingConnection.state.status === VoiceConnectionStatus.Ready &&
          guild.members.me?.voice.channelId === VOICE_CHANNEL_ID) {
        music.attachConnection(existingConnection);
        isReconnecting = false;
        return;
      }
      try {
        existingConnection.destroy();
      } catch { /* best-effort cleanup */ }
    }

    const connection = joinVoiceChannel({
      channelId: VOICE_CHANNEL_ID,
      guildId: VOICE_GUILD_ID,
      adapterCreator: guild.voiceAdapterCreator,
      selfDeaf: false,
      selfMute: false
    });

    connection.on(VoiceConnectionStatus.Ready, async () => {
      music.attachConnection(connection);
      console.log(`[Voice] Voice connection ready in channel: ${channel.name} (${VOICE_CHANNEL_ID})`);
      const embed = new EmbedBuilder()
        .setTitle('🎙️ [음성 상주] 음성 채널 접속 완료')
        .setDescription(`성공적으로 목표 음성 채널에 상주 접속되었습니다.`)
        .addFields(
          { name: '서버 (Guild)', value: `${guild.name} (\`${VOICE_GUILD_ID}\`)`, inline: true },
          { name: '음성 채널', value: `${channel.name} (\`${VOICE_CHANNEL_ID}\`)`, inline: true },
          { name: '상태', value: '🟢 24/7 상주 대기 중 (자동 재진입 활성화)', inline: false }
        )
        .setColor(0x10b981)
        .setTimestamp();

      await sendLog({ embeds: [embed] });
    });

    connection.on(VoiceConnectionStatus.Disconnected, async () => {
      console.warn('[Voice] Voice disconnected, attempting to reconnect...');
      try {
        await Promise.race([
          entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
          entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
        ]);
      } catch {
        console.warn('[Voice] Failed to reconnect automatically, destroying and recreating...');
        try { connection.destroy(); } catch { /* best-effort cleanup */ }
        setTimeout(() => ensureVoiceConnection('Reconnection after disconnect'), 3000);
      }
    });

    connection.on(VoiceConnectionStatus.Destroyed, () => {
      console.warn('[Voice] Voice connection destroyed. Scheduling rejoin...');
      setTimeout(() => ensureVoiceConnection('Reconnection after destroyed'), 3000);
    });

    connection.on('error', (error) => {
      console.error('[Voice] Voice connection error:', error.message);
    });

  } catch (err) {
    console.error('[Voice] Error joining voice channel:', err.message);
  } finally {
    isReconnecting = false;
  }
}

/**
 * 백엔드 서비스 헬스체크
 */
function checkBackendHealth() {
  return new Promise((resolve) => {
    const req = http.get('http://127.0.0.1:3000/health', (res) => {
      resolve(res.statusCode === 200 ? 'OK' : `HTTP ${res.statusCode}`);
    });
    req.on('error', (err) => resolve(`FAIL (${err.message})`));
    req.setTimeout(3000, () => {
      req.destroy();
      resolve('TIMEOUT');
    });
  });
}

client.once(Events.ClientReady, async (c) => {
  console.log(`[Bot] Logged in successfully as ${c.user.tag} (${c.user.id})`);

  c.user.setPresence({
    activities: [{ name: '월덕 머니버스 · 음악 재생', type: ActivityType.Custom }],
    status: 'online',
  });

  const embed = new EmbedBuilder()
    .setTitle('🚀 [시스템 시작] 월덕 머니버스 디스코드 봇 가동')
    .setDescription('머니버스 통합 디스코드 봇 및 시스템 모니터링이 시작되었습니다.')
    .addFields(
      { name: '봇 계정', value: `\`${c.user.tag}\` (\`${c.user.id}\`)`, inline: true },
      { name: '로그 수신 채널', value: `<#${LOG_CHANNEL_ID}> (\`${LOG_CHANNEL_ID}\`)`, inline: true },
      { name: '음성 상주 목표', value: `<#${VOICE_CHANNEL_ID}> (\`${VOICE_CHANNEL_ID}\`)`, inline: false },
      { name: '보안 정책', value: '24/7 연결 유지 · 이탈 시 자동 재진입 활성화', inline: false }
    )
    .setColor(0x3b82f6)
    .setTimestamp();

  await sendLog({ embeds: [embed] });
  await sendAdminDM({ embeds: [embed] });

  const guild = await c.guilds.fetch(VOICE_GUILD_ID).catch(() => null);
  if (guild) {
    try {
      await music.registerCommands(guild);
    } catch (error) {
      console.error('[Music] Failed to register slash commands:', error.message);
      await sendLog(`⚠️ 음악 명령어 등록 실패: ${error.message}`);
    }
  } else {
    console.warn(`[Music] Guild ${VOICE_GUILD_ID} unavailable; slash commands were not registered.`);
  }

  // 음성 채널 즉시 진입
  await ensureVoiceConnection('Initial Boot');

  // Watchdog: 30초마다 음성 연결 상태 검사 및 복구
  watchdogInterval = setInterval(async () => {
    const guild = client.guilds.cache.get(VOICE_GUILD_ID);
    if (!guild) return;
    const botMember = guild.members.me;
    const inVoice = botMember?.voice?.channelId === VOICE_CHANNEL_ID;
    const connection = getVoiceConnection(VOICE_GUILD_ID);

    if (!inVoice || !connection || connection.state.status !== VoiceConnectionStatus.Ready) {
      console.warn('[Watchdog] Voice connection missing or not ready. Triggering auto-rejoin...');
      await ensureVoiceConnection('Watchdog Rejoin');
    }
  }, 30_000);

  // 주기적 헬스체크 리포트 (30분 주기)
  healthCheckInterval = setInterval(async () => {
    const backendStatus = await checkBackendHealth();
    const guild = client.guilds.cache.get(VOICE_GUILD_ID);
    const botMember = guild?.members.me;
    const inVoice = botMember?.voice?.channelId === VOICE_CHANNEL_ID;

    const reportEmbed = new EmbedBuilder()
      .setTitle('📊 [정기 보고] 시스템 & 봇 상태 점검')
      .addFields(
        { name: '백엔드 API', value: backendStatus === 'OK' ? '🟢 정상 (200 OK)' : `🔴 오류: ${backendStatus}`, inline: true },
        { name: '음성 상주 상태', value: inVoice ? `🟢 연결 정상 (<#${VOICE_CHANNEL_ID}>)` : '⚠️ 재접속 중', inline: true },
        { name: '시스템 가동 시간', value: `${Math.floor(process.uptime() / 60)}분`, inline: true }
      )
      .setColor(backendStatus === 'OK' && inVoice ? 0x10b981 : 0xf59e0b)
      .setTimestamp();

    await sendLog({ embeds: [reportEmbed] });
    // 백엔드 상태가 정상이 아닐 경우 관리자 DM으로 즉시 긴급 전송
    if (backendStatus !== 'OK') {
      await sendAdminDM({ embeds: [reportEmbed] });
    }
  }, 30 * 60 * 1000);
});

client.on(Events.InteractionCreate, async (interaction) => {
  try {
    await music.handleInteraction(interaction);
  } catch (error) {
    console.error('[Music] Interaction handling failed:', error.message);
    const payload = { content: '음악 명령 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.' };
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply(payload).catch(() => {});
    } else {
      await interaction.reply(payload).catch(() => {});
    }
  }
});

// VoiceStateUpdate 이벤트: 강퇴되거나 음성방에서 나가지면 즉시 감지하여 자동 재진입
client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
  if (oldState.member?.id !== client.user?.id) return;

  const leftTarget = oldState.channelId === VOICE_CHANNEL_ID && newState.channelId !== VOICE_CHANNEL_ID;
  if (leftTarget) {
    console.warn('[VoiceState] Bot left or was kicked from target voice channel! Rejoining in 2s...');

    const warnEmbed = new EmbedBuilder()
      .setTitle('⚠️ [음성 이탈 감지] 음성방 퇴장 감지됨')
      .setDescription(`봇이 목표 음성 채널(<#${VOICE_CHANNEL_ID}>)에서 이탈 또는 강퇴되었습니다.\n**자동 재진입(Auto-rejoin)을 즉시 실행합니다.**`)
      .setColor(0xef4444)
      .setTimestamp();

    await sendLog({ embeds: [warnEmbed] });
    await sendAdminDM({ embeds: [warnEmbed] });

    setTimeout(() => {
      ensureVoiceConnection('VoiceStateUpdate Rejoin');
    }, 2000);
  }
});

// 실시간 금융 이벤트 브로드캐스트 로컬 HTTP 웹훅 서버 (포트 3099)
const BROADCAST_PORT = Number(process.env.DISCORD_BROADCAST_PORT) || 3099;
let webhookServer = null;

try {
  webhookServer = http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/broadcast') {
      let body = '';
      req.on('data', (chunk) => { body += chunk; });
      req.on('end', async () => {
        try {
          const payload = JSON.parse(body);
          const { title, description, fields = [], color = 0x10b981 } = payload;

          const embed = new EmbedBuilder()
            .setTitle(title || '📢 [월덕 머니버스] 실시간 금융 브로드캐스트')
            .setDescription(description || '')
            .setColor(color)
            .setTimestamp();

          if (Array.isArray(fields)) {
            for (const f of fields) {
              if (f.name && f.value) {
                embed.addFields({ name: f.name, value: f.value, inline: f.inline ?? true });
              }
            }
          }

          await sendLog({ embeds: [embed] });
          if (payload.notifyAdminDm) {
            await sendAdminDM({ embeds: [embed] });
          }
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: true, status: 'Broadcast sent to Discord' }));
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: false, error: e.message }));
        }
      });
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: 'Not found' }));
    }
  });

  webhookServer.listen(BROADCAST_PORT, '127.0.0.1', () => {
    console.log(`[Bot] Realtime broadcast webhook listener running on http://127.0.0.1:${BROADCAST_PORT}/broadcast`);
  });
} catch (err) {
  console.warn('[Bot] Failed to bind broadcast webhook server:', err.message);
}

// 크래시 방지 및 무중단 생존 시스템 (Bot Zero-Downtime & Keep-Alive Protection)
process.on('uncaughtException', (err) => {
  console.error('[Bot Guard] Uncaught Exception intercepted (Process Preserved):', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('[Bot Guard] Unhandled Rejection intercepted (Process Preserved):', reason);
});

client.on(Events.Error, (error) => {
  console.error('[Bot Gateway] Discord Client Error:', error.message);
});

client.on(Events.ShardDisconnect, (event, id) => {
  console.warn(`[Bot Gateway] Shard ${id} disconnected (code: ${event?.code}). Auto-reconnecting...`);
});

client.on(Events.ShardReconnecting, (id) => {
  console.log(`[Bot Gateway] Shard ${id} reconnecting to Discord...`);
});

client.on(Events.ShardResume, (id, replayedEvents) => {
  console.log(`[Bot Gateway] Shard ${id} resumed connection (${replayedEvents} events replayed).`);
});

// 프로세스 정상 종료 시그널 수신 시만 우아한 정리
function cleanup() {
  console.log('[Bot] Graceful shutdown requested. Cleaning up...');
  if (webhookServer) {
    try { webhookServer.close(); } catch { /* ignore */ }
  }
  if (watchdogInterval) clearInterval(watchdogInterval);
  if (healthCheckInterval) clearInterval(healthCheckInterval);
  music.dispose();
  const conn = getVoiceConnection(VOICE_GUILD_ID);
  if (conn) {
    try { conn.destroy(); } catch { /* best-effort cleanup */ }
  }
  client.destroy();
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// 지수 백오프 자동 재연결 로그인 루프 (절대 프로세스 비정상 종료 없음)
async function startBotWithRetry(retries = 0) {
  try {
    await client.login(BOT_TOKEN);
  } catch (err) {
    console.error(`[CRITICAL] Discord bot login failed (Attempt ${retries + 1}):`, err.message);
    const delay = Math.min(30000, 2000 * Math.pow(1.5, retries));
    console.log(`[Bot Guard] Retrying login in ${Math.round(delay / 1000)}s...`);
    setTimeout(() => startBotWithRetry(retries + 1), delay);
  }
}

startBotWithRetry();

