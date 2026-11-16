package com.moneyverse.api.bot.command;

import com.moneyverse.api.domain.stock.dto.StockDtos.StockMarketRow;
import com.moneyverse.api.domain.stock.service.StockService;
import com.moneyverse.api.domain.treasury.service.TreasuryService;
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
import java.util.Map;
import java.util.Optional;

@Component
public class StockSlashCommands {

    private static final Logger log = LoggerFactory.getLogger(StockSlashCommands.class);

    private final StockService stockService;
    private final TreasuryService treasuryService;

    public StockSlashCommands(StockService stockService, TreasuryService treasuryService) {
        this.stockService = stockService;
        this.treasuryService = treasuryService;
    }

    public Mono<Void> handle(ChatInputInteractionEvent event) {
        String commandName = event.getCommandName();

        if ("market".equals(commandName) || "시황".equals(commandName)) {
            return handleMarketCommand(event);
        } else if ("quote".equals(commandName) || "호가".equals(commandName)) {
            return handleQuoteCommand(event);
        } else if ("treasury".equals(commandName) || "국고".equals(commandName)) {
            return handleTreasuryCommand(event);
        }

        return Mono.empty();
    }

    private Mono<Void> handleMarketCommand(ChatInputInteractionEvent event) {
        return event.deferReply().then(Mono.fromCallable(() -> {
            List<StockMarketRow> stocks = stockService.list();

            EmbedCreateSpec.Builder builder = EmbedCreateSpec.builder()
                    .title("📊 [가상 주식] 실시간 시장 시황")
                    .description("월덕 머니버스 가상 주식 실시간 시세 및 펄스 현황입니다.")
                    .color(Color.of(0x63, 0x66, 0xf1))
                    .timestamp(Instant.now());

            if (stocks == null || stocks.isEmpty()) {
                builder.addField("상태", "현재 거래 가능한 상장 종목이 없습니다.", false);
            } else {
                for (int i = 0; i < Math.min(9, stocks.size()); i++) {
                    StockMarketRow s = stocks.get(i);
                    double cur = parseDouble(s.getCurrentPrice());
                    double open = parseDouble(s.getDayOpenPrice());
                    if (open <= 0) open = cur > 0 ? cur : 1;

                    double pct = ((cur - open) / open) * 100.0;
                    String sign = pct > 0 ? "+" : "";
                    String icon = pct > 0 ? "▲" : pct < 0 ? "▼" : "-";

                    String value = String.format("`%,.0f WLD` (%s%.1f%% %s)", cur, sign, pct, icon);
                    builder.addField(s.getName() + " (" + s.getSymbol() + ")", value, true);
                }
            }

            builder.addField("👉 실시간 거래소 바로가기", "[월덕 머니버스 주식 거래소 열기](https://easy-scraping.com/stocks)", false);
            return builder.build();
        })).flatMap(embed -> event.editReply(InteractionReplyEditSpec.builder()
                .addEmbed(embed)
                .build())).then();
    }

    private Mono<Void> handleQuoteCommand(ChatInputInteractionEvent event) {
        Optional<String> symbolOpt = event.getOption("symbol")
                .flatMap(ApplicationCommandInteractionOption::getValue)
                .map(ApplicationCommandInteractionOptionValue::asString);

        if (symbolOpt.isEmpty()) {
            return event.reply("❌ 종목 심볼(symbol)을 입력해주세요. (예: /quote symbol:CHIPS)").withEphemeral(true);
        }

        String symbol = symbolOpt.get().toUpperCase().trim();

        return event.deferReply().then(Mono.fromCallable(() -> {
            List<StockMarketRow> stocks = stockService.list();
            StockMarketRow target = stocks.stream()
                    .filter(s -> (s.getSymbol() != null && s.getSymbol().equalsIgnoreCase(symbol))
                            || (s.getName() != null && s.getName().equalsIgnoreCase(symbol)))
                    .findFirst()
                    .orElse(null);

            if (target == null) {
                return EmbedCreateSpec.builder()
                        .title("❌ 종목 조회 실패: " + symbol)
                        .description("입력하신 종목 심볼 또는 종목명을 찾을 수 없습니다.")
                        .color(Color.of(0xef, 0x44, 0x44))
                        .timestamp(Instant.now())
                        .build();
            }

            double cur = parseDouble(target.getCurrentPrice());
            double open = parseDouble(target.getDayOpenPrice());
            double high = parseDouble(target.getDayHighPrice());
            double low = parseDouble(target.getDayLowPrice());
            if (open <= 0) open = cur > 0 ? cur : 1;

            double pct = ((cur - open) / open) * 100.0;
            String sign = pct > 0 ? "+" : "";
            String icon = pct > 0 ? "▲" : pct < 0 ? "▼" : "-";

            return EmbedCreateSpec.builder()
                    .title("📈 [" + target.getSymbol() + "] " + target.getName())
                    .description(target.getDescription() != null ? target.getDescription() : "월덕 머니버스 공식 상장 기업")
                    .color(pct >= 0 ? Color.of(0x22, 0xc5, 0x5e) : Color.of(0xef, 0x44, 0x44))
                    .addField("현재가", String.format("`%,.0f WLD` (%s%.2f%% %s)", cur, sign, pct, icon), true)
                    .addField("시가 (Open)", String.format("`%,.0f WLD`", open), true)
                    .addField("상태", "`" + target.getHaltStatus() + "`", true)
                    .addField("당일 고가 (High)", String.format("`%,.0f WLD`", high), true)
                    .addField("당일 저가 (Low)", String.format("`%,.0f WLD`", low), true)
                    .addField("유통 주식수", String.format("`%s주`", target.getSharesOutstanding()), true)
                    .timestamp(Instant.now())
                    .build();
        })).flatMap(embed -> event.editReply(InteractionReplyEditSpec.builder()
                .addEmbed(embed)
                .build())).then();
    }

    private Mono<Void> handleTreasuryCommand(ChatInputInteractionEvent event) {
        return event.deferReply().then(Mono.fromCallable(() -> {
            Map<String, Object> overview = treasuryService.getOverview();

            return EmbedCreateSpec.builder()
                    .title("🏛️ [월덕 연방 국고] 재정 및 준비금 현황")
                    .description("중앙 국고, 조폐국, 국부펀드(SWF) 및 예금보험기금(KDIC) 통합 잔액 현황입니다.")
                    .color(Color.of(0xf5, 0x9e, 0x0b))
                    .addField("국고 금고 수", String.valueOf(overview.getOrDefault("vaultCount", 0)), true)
                    .addField("총 유통 통화량", String.valueOf(overview.getOrDefault("totalCirculation", "0")) + " WLD", true)
                    .addField("조폐 총액", String.valueOf(overview.getOrDefault("totalMinted", "0")) + " WLD", true)
                    .timestamp(Instant.now())
                    .build();
        })).flatMap(embed -> event.editReply(InteractionReplyEditSpec.builder()
                .addEmbed(embed)
                .build())).then();
    }

    private double parseDouble(String value) {
        if (value == null) return 0.0;
        try {
            return Double.parseDouble(value.replace(",", "").trim());
        } catch (NumberFormatException e) {
            return 0.0;
        }
    }
}
