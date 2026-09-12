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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const LOG_CHANNEL_ID = process.env.DISCORD_LOG_CHANNEL_ID || '1542465347364589609';
const VOICE_GUILD_ID = process.env.DISCORD_VOICE_GUILD_ID || '1104015535592701984';
const VOICE_CHANNEL_ID = process.env.DISCORD_VOICE_CHANNEL_ID || '1536572442422550538';

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
    const req = http.get('http://127.0.0.1:3000/api/version', (res) => {
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
    activities: [{ name: '월덕 머니버스 & 음성 상주', type: ActivityType.Custom }],
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
        { name: '음성 상주 상태', value: inVoice ? '🟢 연결 정상 (<#1536572442422550538>)' : '⚠️ 재접속 중', inline: true },
        { name: '시스템 가동 시간', value: `${Math.floor(process.uptime() / 60)}분`, inline: true }
      )
      .setColor(backendStatus === 'OK' && inVoice ? 0x10b981 : 0xf59e0b)
      .setTimestamp();

    await sendLog({ embeds: [reportEmbed] });
  }, 30 * 60 * 1000);
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

    setTimeout(() => {
      ensureVoiceConnection('VoiceStateUpdate Rejoin');
    }, 2000);
  }
});

// 프로세스 종료 시 정리
function cleanup() {
  console.log('[Bot] Cleaning up before exit...');
  if (watchdogInterval) clearInterval(watchdogInterval);
  if (healthCheckInterval) clearInterval(healthCheckInterval);
  const conn = getVoiceConnection(VOICE_GUILD_ID);
  if (conn) {
    try { conn.destroy(); } catch { /* best-effort cleanup */ }
  }
  client.destroy();
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

// 클라이언트 로그인 실행
client.login(BOT_TOKEN).catch((err) => {
  console.error('[CRITICAL] Discord bot login failed:', err.message);
  process.exit(1);
});
