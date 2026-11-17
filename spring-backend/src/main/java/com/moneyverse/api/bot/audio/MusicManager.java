package com.moneyverse.api.bot.audio;

import com.sedmelluq.discord.lavaplayer.player.AudioLoadResultHandler;
import com.sedmelluq.discord.lavaplayer.player.AudioPlayer;
import com.sedmelluq.discord.lavaplayer.player.AudioPlayerManager;
import com.sedmelluq.discord.lavaplayer.player.DefaultAudioPlayerManager;
import com.sedmelluq.discord.lavaplayer.source.AudioSourceManagers;
import com.sedmelluq.discord.lavaplayer.tools.FriendlyException;
import com.sedmelluq.discord.lavaplayer.track.AudioPlaylist;
import com.sedmelluq.discord.lavaplayer.track.AudioTrack;
import discord4j.common.util.Snowflake;
import discord4j.core.GatewayDiscordClient;
import discord4j.core.object.entity.channel.AudioChannel;
import discord4j.core.object.entity.channel.VoiceChannel;
import discord4j.core.spec.AudioChannelJoinSpec;
import discord4j.voice.VoiceConnection;
import discord4j.voice.VoiceConnection;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * Lavaplayer 오디오 엔진 및 24/7 디스코드 음성 채널 상주 매니저
 */
@Component
public class MusicManager {

    private static final Logger log = LoggerFactory.getLogger(MusicManager.class);

    @Value("${moneyverse.discord.voice-guild-id:1104015535592701984}")
    private String voiceGuildId;

    @Value("${moneyverse.discord.voice-channel-id:1536572442422550538}")
    private String voiceChannelId;

    private final AudioPlayerManager playerManager;
    private final AudioPlayer player;
    private final TrackScheduler scheduler;
    private final LavaPlayerAudioProvider provider;

    private GatewayDiscordClient gatewayClient;
    private VoiceConnection voiceConnection;
    private final AtomicBoolean isConnecting = new AtomicBoolean(false);

    public MusicManager() {
        this.playerManager = new DefaultAudioPlayerManager();
        AudioSourceManagers.registerRemoteSources(playerManager);
        AudioSourceManagers.registerLocalSource(playerManager);

        this.player = playerManager.createPlayer();
        this.scheduler = new TrackScheduler(player);
        this.player.addListener(scheduler);
        this.provider = new LavaPlayerAudioProvider(player);
        this.player.setVolume(50); // 기본 볼륨 50%
        log.info("[MusicManager] Lavaplayer 2.2.3 audio engine initialized successfully.");
    }

    public void setGatewayClient(GatewayDiscordClient client) {
        this.gatewayClient = client;
    }

    public LavaPlayerAudioProvider getAudioProvider() {
        return provider;
    }

    public TrackScheduler getScheduler() {
        return scheduler;
    }

    public AudioPlayer getPlayer() {
        return player;
    }

    /**
     * 음악 트랙 또는 검색 쿼리 로드 및 대기열 등록 (비동기)
     */
    public CompletableFuture<String> loadAndPlay(String query) {
        CompletableFuture<String> future = new CompletableFuture<>();

        String finalQuery = query.trim();
        if (!finalQuery.startsWith("http://") && !finalQuery.startsWith("https://")) {
            finalQuery = "ytsearch:" + finalQuery;
        }

        playerManager.loadItemOrdered(this, finalQuery, new AudioLoadResultHandler() {
            @Override
            public void trackLoaded(AudioTrack track) {
                boolean queued = scheduler.queue(track);
                if (queued) {
                    future.complete(String.format("🎶 **%s** (%s) 트랙이 재생/대기열에 추가되었습니다.",
                            track.getInfo().title, formatDuration(track.getDuration())));
                } else {
                    future.complete("⚠️ 대기열이 가득 찼습니다 (최대 50곡).");
                }
            }

            @Override
            public void playlistLoaded(AudioPlaylist playlist) {
                List<AudioTrack> tracks = playlist.getTracks();
                if (tracks.isEmpty()) {
                    future.complete("⚠️ 검색된 트랙이 없습니다.");
                    return;
                }

                if (playlist.isSearchResult()) {
                    AudioTrack firstTrack = tracks.get(0);
                    scheduler.queue(firstTrack);
                    future.complete(String.format("🔎 검색 결과: **%s** (%s) 재생 대기열 추가 완료.",
                            firstTrack.getInfo().title, formatDuration(firstTrack.getDuration())));
                } else {
                    int count = 0;
                    for (AudioTrack track : tracks) {
                        if (scheduler.queue(track)) count++;
                    }
                    future.complete(String.format("📑 재생목록 **%s**에서 총 %d곡이 대기열에 추가되었습니다.",
                            playlist.getName(), count));
                }
            }

            @Override
            public void noMatches() {
                future.complete("⚠️ 검색 결과가 없습니다: `" + query + "`");
            }

            @Override
            public void loadFailed(FriendlyException exception) {
                log.error("[MusicManager] Load failed for {}: {}", query, exception.getMessage());
                future.complete("❌ 트랙 로드 실패: " + exception.getMessage());
            }
        });

        return future;
    }

    /**
     * 24/7 음성 채널 상주 보장 (이탈 시 자동 재진입)
     */
    public Mono<Void> ensureVoiceConnection(String reason) {
        if (gatewayClient == null) {
            log.debug("[VoiceStay] Gateway client is not yet ready. Postponing join.");
            return Mono.empty();
        }

        if (isConnecting.compareAndSet(false, true)) {
            log.info("[VoiceStay] Ensuring voice connection to guild={}, channel={} (Reason: {})",
                    voiceGuildId, voiceChannelId, reason);

            return gatewayClient.getChannelById(Snowflake.of(voiceChannelId))
                    .ofType(VoiceChannel.class)
                    .flatMap(channel -> channel.join(AudioChannelJoinSpec.builder()
                            .provider(provider)
                            .selfDeaf(false)
                            .selfMute(false)
                            .build()))
                    .doOnNext(connection -> {
                        this.voiceConnection = connection;
                        log.info("[VoiceStay] Successfully connected and staying in voice channel: {}", voiceChannelId);
                    })
                    .doOnError(err -> log.warn("[VoiceStay] Voice connection attempt failed: {}", err.getMessage()))
                    .doFinally(signal -> isConnecting.set(false))
                    .then();
        }
        return Mono.empty();
    }

    /**
     * 30초 주기 Watchdog: 음성 상주 연결 상태 감시 및 자동 복구
     */
    @Scheduled(fixedRate = 30000, initialDelay = 15000)
    public void watchdogVoiceStay() {
        if (gatewayClient == null) return;

        try {
            boolean isConnected = voiceConnection != null && voiceConnection.isConnected().blockOptional(Duration.ofSeconds(2)).orElse(false);
            if (!isConnected) {
                log.info("[VoiceStay Watchdog] Voice connection disconnected or inactive. Triggering auto-rejoin...");
                ensureVoiceConnection("Watchdog 30s Auto-Recovery").subscribe();
            }
        } catch (Exception e) {
            log.debug("[VoiceStay Watchdog] Watchdog check notice: {}", e.getMessage());
            ensureVoiceConnection("Watchdog Exception Recovery").subscribe();
        }
    }

    private String formatDuration(long millis) {
        if (millis <= 0 || millis == Long.MAX_VALUE) return "실시간 스트림";
        long seconds = millis / 1000;
        long minutes = seconds / 60;
        long hours = minutes / 60;
        long remSeconds = seconds % 60;
        long remMinutes = minutes % 60;

        if (hours > 0) {
            return String.format("%d:%02d:%02d", hours, remMinutes, remSeconds);
        }
        return String.format("%d:%02d", remMinutes, remSeconds);
    }

    @PreDestroy
    public void cleanup() {
        log.info("[MusicManager] Cleaning up audio engine and voice connection...");
        if (player != null) {
            player.destroy();
        }
        if (playerManager != null) {
            playerManager.shutdown();
        }
        if (voiceConnection != null) {
            try {
                voiceConnection.disconnect().block(Duration.ofSeconds(3));
            } catch (Exception ignored) {}
        }
    }
}
