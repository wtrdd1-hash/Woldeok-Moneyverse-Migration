package com.moneyverse.api.bot.service;

import com.moneyverse.api.bot.command.StockSlashCommands;
import discord4j.core.DiscordClientBuilder;
import discord4j.core.GatewayDiscordClient;
import discord4j.core.event.domain.interaction.ChatInputInteractionEvent;
import discord4j.core.object.presence.ClientActivity;
import discord4j.core.object.presence.ClientPresence;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.SmartLifecycle;
import org.springframework.stereotype.Service;

import java.util.concurrent.atomic.AtomicBoolean;

@Service
public class DiscordBotService implements SmartLifecycle {

    private static final Logger log = LoggerFactory.getLogger(DiscordBotService.class);

    @Value("${moneyverse.discord.bot-token:}")
    private String botToken;

    private final StockSlashCommands slashCommands;
    private final DiscordEconomyBroadcaster economyBroadcaster;

    private GatewayDiscordClient gatewayClient;
    private final AtomicBoolean isRunning = new AtomicBoolean(false);

    public DiscordBotService(StockSlashCommands slashCommands, DiscordEconomyBroadcaster economyBroadcaster) {
        this.slashCommands = slashCommands;
        this.economyBroadcaster = economyBroadcaster;
    }

    @Override
    public void start() {
        if (botToken == null || botToken.trim().isEmpty()) {
            log.info("[DiscordBot] Bot token is empty or unconfigured. Discord bot service will remain in standby/disabled mode.");
            return;
        }

        if (isRunning.compareAndSet(false, true)) {
            try {
                log.info("[DiscordBot] Connecting to Discord Gateway using Discord4J...");

                DiscordClientBuilder.create(botToken.trim())
                        .build()
                        .gateway()
                        .setInitialPresence(ignore -> ClientPresence.online(ClientActivity.watching("월덕 머니버스 실시간 거래소")))
                        .login()
                        .subscribe(
                                client -> {
                                    this.gatewayClient = client;
                                    economyBroadcaster.setClient(client);

                                    // 슬래시 커맨드 상호작용 리스너 바인딩
                                    client.on(ChatInputInteractionEvent.class, slashCommands::handle)
                                            .subscribe(
                                                    null,
                                                    err -> log.error("[DiscordBot] Slash command handling error: {}", err.getMessage())
                                            );

                                    log.info("[DiscordBot] Successfully connected to Discord Gateway as single-runtime service!");
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
