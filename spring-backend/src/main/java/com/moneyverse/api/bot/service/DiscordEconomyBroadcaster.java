package com.moneyverse.api.bot.service;

import com.moneyverse.api.domain.stock.dto.StockDtos.StockMarketRow;
import com.moneyverse.api.domain.stock.service.StockService;
import discord4j.common.util.Snowflake;
import discord4j.core.GatewayDiscordClient;
import discord4j.core.object.entity.User;
import discord4j.core.object.entity.channel.MessageChannel;
import discord4j.core.spec.EmbedCreateSpec;
import discord4j.core.spec.MessageCreateSpec;
import discord4j.rest.util.Color;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class DiscordEconomyBroadcaster {

    private static final Logger log = LoggerFactory.getLogger(DiscordEconomyBroadcaster.class);

    @Value("${moneyverse.discord.log-channel-id:1542465347364589609}")
    private String logChannelId;

    @Value("${moneyverse.discord.admin-user-id:889085646768078850}")
    private String adminUserId;

    private final StockService stockService;
    private GatewayDiscordClient client;

    public DiscordEconomyBroadcaster(StockService stockService) {
        this.stockService = stockService;
    }

    public void setClient(GatewayDiscordClient client) {
        this.client = client;
    }

    /**
     * 로그 채널로 일반 텍스트 로그 전송
     */
    public void sendLog(String content) {
        if (client == null || logChannelId == null || logChannelId.isBlank()) return;

        try {
            client.getChannelById(Snowflake.of(logChannelId))
                    .ofType(MessageChannel.class)
                    .flatMap(channel -> channel.createMessage(content))
                    .subscribe(
                            null,
                            err -> log.debug("[DiscordBroadcaster] sendLog failed: {}", err.getMessage())
                    );
        } catch (Exception e) {
            log.debug("[DiscordBroadcaster] sendLog error: {}", e.getMessage());
        }
    }

    /**
     * 관리자 대상 1:1 긴급 다이렉트 메시지(DM) 전송
     */
    public void sendAdminAlert(String alertMessage) {
        if (client == null || adminUserId == null || adminUserId.isBlank()) return;

        try {
            client.getUserById(Snowflake.of(adminUserId))
                    .flatMap(User::getPrivateChannel)
                    .flatMap(channel -> channel.createMessage("⚠️ **[Moneyverse System Alert]**\n" + alertMessage))
                    .subscribe(
                            null,
                            err -> log.debug("[DiscordBroadcaster] sendAdminAlert failed: {}", err.getMessage())
                    );
        } catch (Exception e) {
            log.debug("[DiscordBroadcaster] sendAdminAlert error: {}", e.getMessage());
        }
    }

    /**
     * 혁신 기능 2: 매일 장마감(15:30) 및 정기 시황 자동 브리핑 발행
     */
    @Scheduled(cron = "0 30 15 * * MON-FRI", zone = "Asia/Seoul")
    public void broadcastMarketClosingBriefing() {
        if (client == null || logChannelId == null || logChannelId.isBlank()) return;

        try {
            List<StockMarketRow> stocks = stockService.list();
            if (stocks == null || stocks.isEmpty()) return;

            EmbedCreateSpec.Builder builder = EmbedCreateSpec.builder()
                    .title("📢 [장마감 공식 브리핑] 가상 주식 거래소 일일 마감 결산")
                    .description("오늘의 가상 주식 시장 정규 매매 세션이 종료되었습니다. 주요 종목 종가 결산 현황입니다.")
                    .color(Color.of(0x4f, 0x46, 0xe5))
                    .timestamp(Instant.now());

            for (int i = 0; i < Math.min(6, stocks.size()); i++) {
                StockMarketRow s = stocks.get(i);
                builder.addField(s.getName() + " (" + s.getSymbol() + ")", "`" + s.getCurrentPrice() + " WLD`", true);
            }

            builder.addField("🔗 거래 내역 및 잔고 확인", "[웹 거래소 접속](https://easy-scraping.com/stocks)", false);

            EmbedCreateSpec embed = builder.build();

            client.getChannelById(Snowflake.of(logChannelId))
                    .ofType(MessageChannel.class)
                    .flatMap(ch -> ch.createMessage(MessageCreateSpec.builder().addEmbed(embed).build()))
                    .subscribe(
                            null,
                            err -> log.debug("[DiscordBroadcaster] broadcastMarketClosingBriefing failed: {}", err.getMessage())
                    );
            log.info("[DiscordBroadcaster] Broadcasted market closing briefing to channel {}", logChannelId);
        } catch (Exception e) {
            log.warn("[DiscordBroadcaster] Market closing briefing generation error: {}", e.getMessage());
        }
    }
}
