package com.moneyverse.api.bot.command;

import com.moneyverse.api.bot.audio.MusicManager;
import com.moneyverse.api.bot.audio.TrackScheduler;
import com.sedmelluq.discord.lavaplayer.track.AudioTrack;
import com.sedmelluq.discord.lavaplayer.track.AudioTrackInfo;
import discord4j.core.event.domain.interaction.ChatInputInteractionEvent;
import discord4j.core.object.command.ApplicationCommandInteractionOption;
import discord4j.core.object.command.ApplicationCommandInteractionOptionValue;
import discord4j.core.spec.EmbedCreateSpec;
import discord4j.core.spec.InteractionReplyEditSpec;
import discord4j.rest.util.Color;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.util.List;

/**
 * Lavaplayer 기반 8대 디스코드 음악 슬래시 커맨드 핸들러
 */
@Component
public class MusicSlashCommands {

    private static final Logger log = LoggerFactory.getLogger(MusicSlashCommands.class);

    private final MusicManager musicManager;

    public MusicSlashCommands(MusicManager musicManager) {
        this.musicManager = musicManager;
    }

    public Mono<Void> handle(ChatInputInteractionEvent event) {
        String commandName = event.getCommandName().toLowerCase();

        switch (commandName) {
            case "play":
            case "재생":
                return handlePlay(event);
            case "skip":
            case "스킵":
                return handleSkip(event);
            case "stop":
            case "정지":
                return handleStop(event);
            case "pause":
            case "일시정지":
                return handlePause(event);
            case "resume":
            case "다시재생":
                return handleResume(event);
            case "queue":
            case "대기열":
                return handleQueue(event);
            case "nowplaying":
            case "현재곡":
                return handleNowPlaying(event);
            case "volume":
            case "볼륨":
                return handleVolume(event);
            default:
                return Mono.empty();
        }
    }

    private Mono<Void> handlePlay(ChatInputInteractionEvent event) {
        String query = event.getOption("query")
                .flatMap(ApplicationCommandInteractionOption::getValue)
                .map(ApplicationCommandInteractionOptionValue::asString)
                .orElse(null);

        if (query == null || query.isBlank()) {
            return event.reply("⚠️ 재생할 곡의 제목이나 유튜브 URL을 입력해 주세요. 예: `/play 아이유 밤편지`")
                    .withEphemeral(true);
        }

        return event.deferReply()
                .then(musicManager.ensureVoiceConnection("Command /play invoked"))
                .then(Mono.fromFuture(musicManager.loadAndPlay(query)))
                .flatMap(result -> event.editReply(InteractionReplyEditSpec.builder()
                        .contentOrNull(result)
                        .build()))
                .then();
    }

    private Mono<Void> handleSkip(ChatInputInteractionEvent event) {
        TrackScheduler scheduler = musicManager.getScheduler();
        AudioTrack skipped = scheduler.getPlayingTrack();
        AudioTrack next = scheduler.nextTrack();

        String message;
        if (skipped != null) {
            message = String.format("⏭️ **%s** 곡을 건너뛰었습니다.", skipped.getInfo().title);
            if (next != null) {
                message += String.format(" 다음 재생: **%s**", next.getInfo().title);
            } else {
                message += " 대기열에 더 이상 곡이 없습니다.";
            }
        } else {
            message = "⚠️ 현재 재생 중인 곡이 없습니다.";
        }

        return event.reply(message);
    }

    private Mono<Void> handleStop(ChatInputInteractionEvent event) {
        musicManager.getScheduler().stop();
        return event.reply("⏹️ 음악 재생을 중지하고 대기열을 모두 비웠습니다.");
    }

    private Mono<Void> handlePause(ChatInputInteractionEvent event) {
        TrackScheduler scheduler = musicManager.getScheduler();
        if (scheduler.getPlayingTrack() == null) {
            return event.reply("⚠️ 현재 재생 중인 음악이 없습니다.");
        }
        scheduler.pause();
        return event.reply("⏸️ 음악 재생을 일시 정지했습니다. `/resume` 명령으로 다시 재생할 수 있습니다.");
    }

    private Mono<Void> handleResume(ChatInputInteractionEvent event) {
        TrackScheduler scheduler = musicManager.getScheduler();
        if (!scheduler.isPaused()) {
            return event.reply("⚠️ 일시 정지된 상태가 아닙니다.");
        }
        scheduler.resume();
        return event.reply("▶️ 음악 재생을 다시 시작합니다.");
    }

    private Mono<Void> handleQueue(ChatInputInteractionEvent event) {
        TrackScheduler scheduler = musicManager.getScheduler();
        AudioTrack playing = scheduler.getPlayingTrack();
        List<AudioTrack> queue = scheduler.getQueue();

        EmbedCreateSpec.Builder builder = EmbedCreateSpec.builder()
                .title("📑 [재생 대기열] 월덕 머니버스 뮤직")
                .color(Color.of(0x10, 0xb9, 0x81))
                .timestamp(Instant.now());

        if (playing != null) {
            builder.addField("▶️ 현재 재생 중", String.format("**%s** (`%s`)",
                    playing.getInfo().title, formatTime(playing.getDuration())), false);
        } else {
            builder.addField("▶️ 현재 재생 중", "재생 중인 곡 없음", false);
        }

        if (queue.isEmpty()) {
            builder.addField("대기열", "대기 중인 곡이 없습니다. `/play`로 곡을 추가해보세요.", false);
        } else {
            StringBuilder sb = new StringBuilder();
            int limit = Math.min(10, queue.size());
            for (int i = 0; i < limit; i++) {
                AudioTrackInfo info = queue.get(i).getInfo();
                sb.append(String.format("`%d.` **%s** (`%s`)\n", i + 1, info.title, formatTime(info.length)));
            }
            if (queue.size() > 10) {
                sb.append(String.format("... 외 %d곡 대기 중", queue.size() - 10));
            }
            builder.addField(String.format("다음 대기열 (총 %d곡)", queue.size()), sb.toString(), false);
        }

        return event.reply().withEmbeds(builder.build());
    }

    private Mono<Void> handleNowPlaying(ChatInputInteractionEvent event) {
        AudioTrack playing = musicManager.getScheduler().getPlayingTrack();
        if (playing == null) {
            return event.reply("⚠️ 현재 재생 중인 음악이 없습니다.");
        }

        AudioTrackInfo info = playing.getInfo();
        long pos = playing.getPosition();
        long dur = playing.getDuration();

        EmbedCreateSpec embed = EmbedCreateSpec.builder()
                .title("🎵 현재 재생 중인 곡")
                .description(String.format("[%s](%s)", info.title, info.uri))
                .addField("아티스트", info.author != null ? info.author : "알 수 없음", true)
                .addField("진행 시간", String.format("`%s / %s`", formatTime(pos), formatTime(dur)), true)
                .color(Color.of(0x3b, 0x82, 0xf6))
                .timestamp(Instant.now())
                .build();

        return event.reply().withEmbeds(embed);
    }

    private Mono<Void> handleVolume(ChatInputInteractionEvent event) {
        long level = event.getOption("level")
                .flatMap(ApplicationCommandInteractionOption::getValue)
                .map(ApplicationCommandInteractionOptionValue::asLong)
                .orElse(50L);

        int vol = (int) Math.max(0, Math.min(100, level));
        musicManager.getScheduler().setVolume(vol);
        return event.reply(String.format("🔊 볼륨이 **%d%%**로 설정되었습니다.", vol));
    }

    private String formatTime(long millis) {
        if (millis <= 0 || millis == Long.MAX_VALUE) return "실시간";
        long seconds = millis / 1000;
        long remSeconds = seconds % 60;
        long minutes = (seconds / 60) % 60;
        long hours = seconds / 3600;

        if (hours > 0) {
            return String.format("%d:%02d:%02d", hours, minutes, remSeconds);
        }
        return String.format("%d:%02d", minutes, remSeconds);
    }
}
