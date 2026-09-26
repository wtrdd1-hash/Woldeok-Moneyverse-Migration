import https from 'node:https';
import { spawn } from 'node:child_process';
import youtubedl from 'youtube-dl-exec';
import {
  AudioPlayerStatus,
  NoSubscriberBehavior,
  StreamType,
  VoiceConnectionStatus,
  createAudioPlayer,
  createAudioResource,
  getVoiceConnection,
} from '@discordjs/voice';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';

export function extractYouTubeVideoId(url) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === 'youtu.be') return parsed.pathname.slice(1).split(/[?#]/)[0];
    if (parsed.searchParams.has('v')) return parsed.searchParams.get('v');
    const match = parsed.pathname.match(/\/(?:shorts|embed|v)\/([a-zA-Z0-9_-]{11})/);
    if (match) return match[1];
  } catch {
    /* ignore */
  }
  return null;
}

export async function fetchSponsorBlockSkipSegments(videoId) {
  if (!videoId) return [];
  return new Promise((resolve) => {
    const categories = JSON.stringify(['sponsor', 'music_offtopic', 'selfpromo', 'intro', 'outro']);
    const url = `https://sponsor.ajay.app/api/skipSegments?videoID=${encodeURIComponent(videoId)}&categories=${encodeURIComponent(categories)}`;
    const req = https.get(url, { timeout: 3000 }, (res) => {
      if (res.statusCode !== 200) {
        res.resume();
        return resolve([]);
      }
      let raw = '';
      res.on('data', (chunk) => { raw += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(raw);
          const segments = Array.isArray(parsed)
            ? parsed.filter((s) => Array.isArray(s.segment) && s.segment.length === 2 && s.actionType === 'skip')
            : [];
          resolve(segments);
        } catch {
          resolve([]);
        }
      });
    });
    req.on('error', () => resolve([]));
    req.on('timeout', () => { req.destroy(); resolve([]); });
  });
}

const MAX_QUEUE_LENGTH = 50;
const DEFAULT_MAX_TRACK_SECONDS = Infinity;
const YOUTUBE_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'music.youtube.com',
  'youtu.be',
]);

export const MUSIC_COMMAND_NAMES = new Set([
  'play',
  'skip',
  'stop',
  'pause',
  'resume',
  'queue',
  'nowplaying',
  'volume',
]);

export const MUSIC_COMMANDS = [
  new SlashCommandBuilder()
    .setName('play')
    .setNameLocalizations({ ko: '재생' })
    .setDescription('Play a YouTube track or add it to the queue')
    .setDescriptionLocalizations({ ko: '유튜브 음악을 재생하거나 대기열에 추가합니다' })
    .addStringOption((option) =>
      option
        .setName('query')
        .setNameLocalizations({ ko: '검색어' })
        .setDescription('YouTube URL or search query')
        .setDescriptionLocalizations({ ko: '유튜브 주소 또는 검색어' })
        .setRequired(true)
        .setMaxLength(200),
    ),
  new SlashCommandBuilder()
    .setName('skip')
    .setNameLocalizations({ ko: '스킵' })
    .setDescription('Skip the current track')
    .setDescriptionLocalizations({ ko: '현재 곡을 건너뜁니다' }),
  new SlashCommandBuilder()
    .setName('stop')
    .setNameLocalizations({ ko: '정지' })
    .setDescription('Stop playback and clear the queue')
    .setDescriptionLocalizations({ ko: '재생을 멈추고 대기열을 비웁니다' }),
  new SlashCommandBuilder()
    .setName('pause')
    .setNameLocalizations({ ko: '일시정지' })
    .setDescription('Pause the current track')
    .setDescriptionLocalizations({ ko: '현재 곡을 일시정지합니다' }),
  new SlashCommandBuilder()
    .setName('resume')
    .setNameLocalizations({ ko: '계속재생' })
    .setDescription('Resume the paused track')
    .setDescriptionLocalizations({ ko: '일시정지된 곡을 다시 재생합니다' }),
  new SlashCommandBuilder()
    .setName('queue')
    .setNameLocalizations({ ko: '대기열' })
    .setDescription('Show the current music queue')
    .setDescriptionLocalizations({ ko: '현재 음악 대기열을 표시합니다' }),
  new SlashCommandBuilder()
    .setName('nowplaying')
    .setNameLocalizations({ ko: '현재곡' })
    .setDescription('Show the currently playing track')
    .setDescriptionLocalizations({ ko: '현재 재생 중인 곡을 표시합니다' }),
  new SlashCommandBuilder()
    .setName('volume')
    .setNameLocalizations({ ko: '볼륨' })
    .setDescription('Adjust or view playback volume (0-200%)')
    .setDescriptionLocalizations({ ko: '재생 볼륨을 조절하거나 확인합니다 (0-200%)' })
    .addIntegerOption((option) =>
      option
        .setName('level')
        .setNameLocalizations({ ko: '수치' })
        .setDescription('Volume level (0 to 200)')
        .setDescriptionLocalizations({ ko: '볼륨 수치 (0 ~ 200)' })
        .setRequired(false)
        .setMinValue(0)
        .setMaxValue(200),
    ),
].map((command) => command.toJSON());

export function formatDuration(totalSeconds) {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return '알 수 없음';
  const seconds = Math.floor(totalSeconds);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;
  if (hours > 0) return `${hours}:${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
  return `${minutes}:${String(remainder).padStart(2, '0')}`;
}

export function isAllowedYouTubeUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' && YOUTUBE_HOSTS.has(parsed.hostname.toLowerCase());
  } catch {
    return false;
  }
}

function toSafeTrack(result, requestedBy, fallbackUrl, maxTrackSeconds) {
  if (!result || typeof result !== 'object') throw new Error('검색 결과를 불러오지 못했습니다.');
  const duration = Number(result.duration);
  if (result.is_live || result.live_status === 'is_live') {
    throw new Error('실시간 방송은 현재 음악 봇에서 지원하지 않습니다.');
  }
  if (Number.isFinite(duration) && Number.isFinite(maxTrackSeconds) && maxTrackSeconds > 0 && duration > maxTrackSeconds) {
    throw new Error(`최대 재생 길이(${formatDuration(maxTrackSeconds)})를 초과한 곡입니다.`);
  }

  const url = result.webpage_url || result.original_url || fallbackUrl;
  if (!isAllowedYouTubeUrl(url)) throw new Error('현재는 YouTube 음악만 재생할 수 있습니다.');

  return {
    id: String(result.id || url),
    title: String(result.title || '제목 없음').slice(0, 200),
    url,
    duration: Number.isFinite(duration) ? duration : null,
    thumbnail: typeof result.thumbnail === 'string' ? result.thumbnail : null,
    requestedBy,
  };
}

export class MusicManager {
  constructor({ guildId, voiceChannelId, logger = console, maxTrackSeconds, ensureVoiceConnection }) {
    this.guildId = guildId;
    this.voiceChannelId = voiceChannelId;
    this.logger = logger;
    this.ensureVoiceConnection = ensureVoiceConnection;
    this.maxTrackSeconds = Number.isFinite(maxTrackSeconds) && maxTrackSeconds > 0
      ? maxTrackSeconds
      : DEFAULT_MAX_TRACK_SECONDS;
    this.queue = [];
    this.current = null;
    this.currentProcess = null;
    this.currentFfmpegProcess = null;
    this.currentResource = null;
    this.volume = 100;
    this.starting = false;
    this.disposed = false;
    this.player = createAudioPlayer({
      behaviors: { noSubscriber: NoSubscriberBehavior.Play },
    });

    this.player.on(AudioPlayerStatus.Idle, () => {
      if (this.starting) return;
      this.#killCurrentProcess();
      this.current = null;
      this.currentResource = null;
      void this.#playNext();
    });

    this.player.on('error', (error) => {
      this.logger.error?.('[Music] Audio player error:', error.message);
      if (this.starting) return;
      this.#killCurrentProcess();
      this.current = null;
      this.currentResource = null;
      void this.#playNext();
    });
  }

  attachConnection(connection) {
    if (!connection || this.disposed) return;
    connection.subscribe(this.player);
  }

  async registerCommands(guild) {
    await guild.commands.set(MUSIC_COMMANDS);
    this.logger.log?.(`[Music] Reset and registered ${MUSIC_COMMANDS.length} guild music commands.`);
  }

  async handleInteraction(interaction) {
    if (!interaction.isChatInputCommand()) return false;
    if (interaction.guildId !== this.guildId || !MUSIC_COMMAND_NAMES.has(interaction.commandName)) return false;

    if (interaction.commandName === 'queue') {
      await interaction.reply({ embeds: [this.#queueEmbed()] });
      return true;
    }
    if (interaction.commandName === 'nowplaying') {
      await interaction.reply({ embeds: [this.#nowPlayingEmbed()] });
      return true;
    }

    const member = await interaction.guild.members.fetch(interaction.user.id);
    if (member.voice.channelId !== this.voiceChannelId) {
      await interaction.reply({
        content: `음악 제어는 <#${this.voiceChannelId}> 음성 채널에 들어온 상태에서만 사용할 수 있습니다.`,
      });
      return true;
    }

    switch (interaction.commandName) {
      case 'play':
        await this.#handlePlay(interaction);
        break;
      case 'skip':
        await this.#handleSkip(interaction);
        break;
      case 'stop':
        await this.#handleStop(interaction);
        break;
      case 'pause':
        await this.#handlePause(interaction);
        break;
      case 'resume':
        await this.#handleResume(interaction);
        break;
      case 'volume':
        await this.#handleVolume(interaction);
        break;
      default:
        break;
    }
    return true;
  }

  async #handlePlay(interaction) {
    await interaction.deferReply();
    if (this.queue.length >= MAX_QUEUE_LENGTH) {
      await interaction.editReply('대기열이 가득 찼습니다. 잠시 후 다시 시도해 주세요.');
      return;
    }

    const query = interaction.options.getString('query', true).trim();
    try {
      const track = await this.#resolveTrack(query, interaction.user.id);
      const position = this.current ? this.queue.length + 1 : 0;
      this.queue.push(track);
      await this.#playNext();

      const status = position === 0 && this.current?.id === track.id
        ? '재생을 시작했습니다.'
        : `대기열 ${Math.max(1, position)}번에 추가했습니다.`;
      await interaction.editReply({
        content: `${status}\n**${track.title}** · ${formatDuration(track.duration)}`,
      });
    } catch (error) {
      this.logger.warn?.('[Music] Failed to resolve track:', error.message);
      await interaction.editReply(`곡을 불러오지 못했습니다: ${error.message}`);
    }
  }

  async #handleSkip(interaction) {
    if (!this.current) {
      await interaction.reply({ content: '현재 재생 중인 곡이 없습니다.' });
      return;
    }
    const skipped = this.current.title;
    this.#killCurrentProcess();
    this.player.stop(true);
    await interaction.reply({ content: `⏭️ **${skipped}** 곡을 건너뛰었습니다.` });
  }

  async #handleStop(interaction) {
    const hadPlayback = Boolean(this.current || this.queue.length);
    this.queue.length = 0;
    this.#killCurrentProcess();
    this.current = null;
    this.currentResource = null;
    this.player.stop(true);
    await interaction.reply({
      content: hadPlayback ? '⏹️ 재생을 멈추고 대기열을 비웠습니다.' : '현재 재생 중인 곡이 없습니다.',
    });
  }

  async #handlePause(interaction) {
    if (!this.current || !this.player.pause()) {
      await interaction.reply({ content: '일시정지할 재생 중인 곡이 없습니다.' });
      return;
    }
    await interaction.reply({ content: '⏸️ 음악을 일시정지했습니다.' });
  }

  async #handleResume(interaction) {
    if (!this.current || !this.player.unpause()) {
      await interaction.reply({ content: '계속 재생할 일시정지된 곡이 없습니다.' });
      return;
    }
    await interaction.reply({ content: '▶️ 음악을 다시 재생합니다.' });
  }

  async #handleVolume(interaction) {
    const level = interaction.options.getInteger('level');
    if (level === null) {
      await interaction.reply({
        content: `🔊 현재 볼륨은 **${this.volume}%** 입니다.`,
      });
      return;
    }

    this.volume = Math.max(0, Math.min(200, level));
    if (this.currentResource?.volume) {
      this.currentResource.volume.setVolume(this.volume / 100);
    }
    const icon = this.volume === 0 ? '🔇' : this.volume < 50 ? '🔉' : '🔊';
    await interaction.reply({
      content: `${icon} 볼륨을 **${this.volume}%** 로 설정했습니다.`,
    });
  }

  async #resolveTrack(query, requestedBy) {
    if (!query) throw new Error('검색어나 YouTube 주소를 입력해 주세요.');

    const isUrl = /^https?:\/\//i.test(query);
    if (isUrl && !isAllowedYouTubeUrl(query)) {
      throw new Error('현재는 YouTube 주소만 지원합니다.');
    }

    const target = isUrl ? query : `ytsearch1:${query}`;
    const result = await youtubedl(target, {
      dumpSingleJson: true,
      skipDownload: true,
      noWarnings: true,
      noPlaylist: true,
      jsRuntimes: 'node',
    });
    const entry = Array.isArray(result.entries) ? result.entries[0] : result;
    if (!entry) throw new Error('검색 결과가 없습니다.');
    return toSafeTrack(entry, requestedBy, isUrl ? query : entry.webpage_url, this.maxTrackSeconds);
  }

  async #playNext() {
    if (this.disposed || this.current || this.starting || this.queue.length === 0) return;
    this.starting = true;
    const track = this.queue.shift();

    try {
      let connection = getVoiceConnection(this.guildId);
      if ((!connection || connection.state.status !== VoiceConnectionStatus.Ready) && typeof this.ensureVoiceConnection === 'function') {
        await this.ensureVoiceConnection('Playback request');
        connection = getVoiceConnection(this.guildId);
      }
      if (!connection) throw new Error('음성 채널 연결이 준비되지 않았습니다.');
      this.attachConnection(connection);

      const videoId = extractYouTubeVideoId(track.url);
      const sponsorSegments = videoId ? await fetchSponsorBlockSkipSegments(videoId) : [];

      const process = youtubedl.exec(track.url, {
        output: '-',
        format: 'bestaudio[ext=webm][acodec=opus]/bestaudio[ext=webm]/bestaudio/best',
        noPlaylist: true,
        quiet: true,
        noWarnings: true,
        jsRuntimes: 'node',
      });
      this.currentProcess = process;
      process.catch((error) => {
        if (process.killed || this.disposed) return;
        const msg = String(error?.message || '');
        if (msg.includes('SIGKILL') || msg.includes('Broken pipe')) return;
        this.logger.error?.('[Music] yt-dlp stream error:', msg);
      });

      const ffmpegArgs = ['-i', 'pipe:0'];

      if (sponsorSegments.length > 0) {
        const ranges = sponsorSegments.map((s) => `not(between(t,${s.segment[0]},${s.segment[1]}))`).join('*');
        const filter = `aselect='${ranges}',asetpts=N/SR/TB`;
        this.logger.log?.(`[Music] Slicing out ${sponsorSegments.length} SponsorBlock segment(s) via FFmpeg filter: ${filter}`);
        ffmpegArgs.push('-af', filter);
      }

      ffmpegArgs.push(
        '-f', 's16le',
        '-ar', '48000',
        '-ac', '2',
        'pipe:1',
      );

      const ffmpeg = spawn('ffmpeg', ffmpegArgs);
      this.currentFfmpegProcess = ffmpeg;
      process.stdout.pipe(ffmpeg.stdin);
      process.stdout.on('error', () => {});
      ffmpeg.stdin.on('error', () => {});
      ffmpeg.on('error', (err) => {
        if (this.disposed || ffmpeg.killed) return;
        this.logger.error?.('[Music] FFmpeg audio filter error:', err.message);
      });

      const resource = createAudioResource(ffmpeg.stdout, {
        inputType: StreamType.Raw,
        metadata: track,
        inlineVolume: true,
      });

      this.current = track;
      if (resource.volume) {
        resource.volume.setVolume(this.volume / 100);
      }
      this.currentResource = resource;
      this.player.play(resource);
      this.logger.log?.(`[Music] Playing ${track.title} (${track.url}) [Volume: ${this.volume}%]`);
    } catch (error) {
      this.logger.error?.('[Music] Failed to start track:', error.message);
      this.#killCurrentProcess();
      this.current = null;
      this.currentResource = null;
      setImmediate(() => void this.#playNext());
    } finally {
      this.starting = false;
    }
  }

  #killCurrentProcess() {
    const process = this.currentProcess;
    this.currentProcess = null;
    if (process && !process.killed) {
      process.catch(() => {});
      try {
        process.kill('SIGKILL');
      } catch {
        /* ignore */
      }
    }
    const ffmpeg = this.currentFfmpegProcess;
    this.currentFfmpegProcess = null;
    if (ffmpeg && !ffmpeg.killed) {
      try {
        ffmpeg.kill('SIGKILL');
      } catch {
        /* ignore */
      }
    }
  }

  #nowPlayingEmbed() {
    const embed = new EmbedBuilder().setTitle('🎵 현재 재생 중').setTimestamp();
    if (!this.current) return embed.setDescription('현재 재생 중인 곡이 없습니다.').setColor(0x6b7280);
    embed
      .setDescription(`[${this.current.title}](${this.current.url})`)
      .addFields(
        { name: '길이', value: formatDuration(this.current.duration), inline: true },
        { name: '신청자', value: `<@${this.current.requestedBy}>`, inline: true },
        { name: '볼륨', value: `${this.volume}%`, inline: true },
      )
      .setColor(0x8b5cf6);
    if (this.current.thumbnail) embed.setThumbnail(this.current.thumbnail);
    return embed;
  }

  #queueEmbed() {
    const embed = new EmbedBuilder().setTitle('🎶 음악 대기열').setTimestamp().setColor(0x3b82f6);
    const lines = [];
    if (this.current) lines.push(`**재생 중** · [${this.current.title}](${this.current.url})`);
    this.queue.slice(0, 10).forEach((track, index) => {
      lines.push(`${index + 1}. [${track.title}](${track.url}) · ${formatDuration(track.duration)}`);
    });
    if (this.queue.length > 10) lines.push(`…외 ${this.queue.length - 10}곡`);
    embed.setDescription(lines.length ? lines.join('\n') : '대기열이 비어 있습니다.');
    return embed;
  }

  dispose() {
    this.disposed = true;
    this.queue.length = 0;
    this.current = null;
    this.currentResource = null;
    this.#killCurrentProcess();
    this.player.stop(true);
  }
}
