package com.moneyverse.api.bot.service;

import com.moneyverse.api.bot.audio.MusicManager;
import com.moneyverse.api.bot.command.MusicSlashCommands;
import com.moneyverse.api.bot.command.StockSlashCommands;
import discord4j.core.DiscordClientBuilder;
import discord4j.core.GatewayDiscordClient;
import discord4j.core.event.domain.interaction.ChatInputInteractionEvent;
import discord4j.core.object.command.ApplicationCommandOption;
import discord4j.core.object.presence.ClientActivity;
import discord4j.core.object.presence.ClientPresence;
import discord4j.discordjson.json.ApplicationCommandOptionData;
import discord4j.discordjson.json.ApplicationCommandRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.SmartLifecycle;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * Moneyverse 통합 디스코드 봇 서비스 (Spring Boot 3.3.5 단일 JAR 런타임)
 * - Lavaplayer 2.2.3 기반 음악 재생
 * - 24/7 지정 음성 채널 상주 및 자동 복구
 * - 주식 및 음악 11대 슬래시 커맨드
 * - 실시간 경제 방송 및 알림
 */
@Service
public class DiscordBotService implements SmartLifecycle {

    private static final Logger log = LoggerFactory.getLogger(DiscordBotService.class);

    @Value("${moneyverse.discord.bot-token:}")
    private String botToken;

    @Value("${moneyverse.discord.voice-guild-id:1104015535592701984}")
    private String voiceGuildId;

    @Value("${moneyverse.discord.voice-channel-id:1536572442422550538}")
    private String voiceChannelId;

    private final StockSlashCommands stockSlashCommands;
    private final MusicSlashCommands musicSlashCommands;
    private final MusicManager musicManager;
    private final DiscordEconomyBroadcaster economyBroadcaster;

    private GatewayDiscordClient gatewayClient;
    private final AtomicBoolean isRunning = new AtomicBoolean(false);

    public DiscordBotService(StockSlashCommands stockSlashCommands,
                             MusicSlashCommands musicSlashCommands,
                             MusicManager musicManager,
                             DiscordEconomyBroadcaster economyBroadcaster) {
        this.stockSlashCommands = stockSlashCommands;
        this.musicSlashCommands = musicSlashCommands;
        this.musicManager = musicManager;
        this.economyBroadcaster = economyBroadcaster;
    }

    @Override
    public void start() {
        if (botToken == null || botToken.trim().isEmpty()) {
            log.info("[DiscordBot] Bot token is empty or unconfigured. Discord bot service will remain in standby mode.");
            return;
        }

        if (isRunning.compareAndSet(false, true)) {
            try {
                log.info("[DiscordBot] Initializing unified Discord Bot (Discord4J + Lavaplayer)...");

                DiscordClientBuilder.create(botToken.trim())
                        .build()
                        .gateway()
                        .setInitialPresence(ignore -> ClientPresence.online(ClientActivity.watching("월덕 머니버스 · 음악 & 거래소")))
                        .login()
                        .subscribe(
                                client -> {
                                    this.gatewayClient = client;
                                    economyBroadcaster.setClient(client);
                                    musicManager.setGatewayClient(client);

                                    // 1. 슬래시 커맨드 라우팅 리스너 바인딩
                                    client.on(ChatInputInteractionEvent.class, event -> {
                                        String name = event.getCommandName().toLowerCase();
                                        if ("market".equals(name) || "시황".equals(name) ||
                                            "quote".equals(name) || "호가".equals(name) ||
                                            "treasury".equals(name) || "국고".equals(name)) {
                                            return stockSlashCommands.handle(event);
                                        } else {
                                            return musicSlashCommands.handle(event);
                                        }
                                    }).subscribe(
                                            null,
                                            err -> log.error("[DiscordBot] Slash command handling error: {}", err.getMessage())
                                    );

                                    // 2. 길드 슬래시 커맨드 일괄 등록
                                    registerGuildCommands(client);

                                    // 3. 목표 음성 채널 즉시 진입 및 24/7 상주 시작
                                    musicManager.ensureVoiceConnection("Initial Boot Connection")
                                            .subscribe(
                                                    null,
                                                    err -> log.warn("[DiscordBot] Initial voice connection warning: {}", err.getMessage())
                                            );

                                    log.info("[DiscordBot] Successfully connected to Discord Gateway as 100% unified Spring Boot service!");
                                },
                                err -> {
                                    log.warn("[DiscordBot] Failed to login to Discord Gateway: {}. Standby mode retained.", err.getMessage());
                                    isRunning.set(false);
                                }
                        );
            } catch (Exception e) {
                log.warn("[DiscordBot] Initialization exception: {}", e.getMessage());
                isRunning.set(false);
            }
        }
    }

    private void registerGuildCommands(GatewayDiscordClient client) {
        try {
            long applicationId = client.getRestClient().getApplicationId().block();
            long guildId = Long.parseLong(voiceGuildId.trim());

            List<ApplicationCommandRequest> commands = new ArrayList<>();

            // 음악 명령어 8종
            commands.add(ApplicationCommandRequest.builder()
                    .name("play")
                    .description("유튜브 영상 또는 음악을 재생합니다.")
                    .addOption(ApplicationCommandOptionData.builder()
                            .name("query")
                            .description("노래 제목 또는 유튜브 URL")
                            .type(ApplicationCommandOption.Type.STRING.getValue())
                            .required(true)
                            .build())
                    .build());

            commands.add(ApplicationCommandRequest.builder()
                    .name("skip")
                    .description("현재 재생 중인 곡을 건너뜁니다.")
                    .build());

            commands.add(ApplicationCommandRequest.builder()
                    .name("stop")
                    .description("음악 재생을 중지하고 대기열을 모두 비웁니다.")
                    .build());

            commands.add(ApplicationCommandRequest.builder()
                    .name("pause")
                    .description("음악 재생을 일시 정지합니다.")
                    .build());

            commands.add(ApplicationCommandRequest.builder()
                    .name("resume")
                    .description("일시 정지된 음악 재생을 다시 시작합니다.")
                    .build());

            commands.add(ApplicationCommandRequest.builder()
                    .name("queue")
                    .description("현재 재생 대기열 목록을 확인합니다.")
                    .build());

            commands.add(ApplicationCommandRequest.builder()
                    .name("nowplaying")
                    .description("현재 재생 중인 곡의 상세 정보를 확인합니다.")
                    .build());

            commands.add(ApplicationCommandRequest.builder()
                    .name("volume")
                    .description("플레이어 볼륨을 설정합니다 (0~100).")
                    .addOption(ApplicationCommandOptionData.builder()
                            .name("level")
                            .description("볼륨 수치 (0-100)")
                            .type(ApplicationCommandOption.Type.INTEGER.getValue())
                            .required(true)
                            .build())
                    .build());

            // 주식/경제 명령어 3종
            commands.add(ApplicationCommandRequest.builder()
                    .name("market")
                    .description("가상 주식 실시간 시장 시황 및 펄스를 조회합니다.")
                    .build());

            commands.add(ApplicationCommandRequest.builder()
                    .name("quote")
                    .description("특정 종목의 실시간 호가 및 시세를 조회합니다.")
                    .addOption(ApplicationCommandOptionData.builder()
                            .name("symbol")
                            .description("주식 티커 심볼 (예: WDM, WDT, WFIN)")
                            .type(ApplicationCommandOption.Type.STRING.getValue())
                            .required(true)
                            .build())
                    .build());

            commands.add(ApplicationCommandRequest.builder()
                    .name("treasury")
                    .description("국고 5대 금고 및 국부펀드(ASWF) 운용 현황을 조회합니다.")
                    .build());

            client.getRestClient().getApplicationService()
                    .bulkOverwriteGuildApplicationCommand(applicationId, guildId, commands)
                    .subscribe(
                            cmd -> log.debug("[DiscordBot] Registered command: {}", cmd.name()),
                            err -> log.warn("[DiscordBot] Failed to bulk overwrite guild commands: {}", err.getMessage()),
                            () -> log.info("[DiscordBot] Successfully registered {} guild slash commands to guild {}", commands.size(), guildId)
                    );
        } catch (Exception e) {
            log.warn("[DiscordBot] Exception registering guild commands: {}", e.getMessage());
        }
    }

    @Override
    public void stop() {
        if (isRunning.compareAndSet(true, false) && gatewayClient != null) {
            try {
                gatewayClient.logout().block();
                log.info("[DiscordBot] Gateway client logged out cleanly");
            } catch (Exception e) {
                log.debug("[DiscordBot] Exception during logout: {}", e.getMessage());
            }
        }
    }

    @Override
    public boolean isRunning() {
        return isRunning.get();
    }
}
