package com.moneyverse.api.socket.streamer;

import com.corundumstudio.socketio.SocketIOServer;
import com.moneyverse.api.socket.service.SocketIoService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class StockMarketSocketStreamer {

    private static final Logger log = LoggerFactory.getLogger(StockMarketSocketStreamer.class);

    private final JdbcTemplate jdbcTemplate;
    private final SocketIoService socketIoService;

    public StockMarketSocketStreamer(JdbcTemplate jdbcTemplate, SocketIoService socketIoService) {
        this.jdbcTemplate = jdbcTemplate;
        this.socketIoService = socketIoService;
    }

    /**
     * 2초마다 10대 상장사 실시간 시세를 조회하여 Netty-SocketIO로 실시간 브로드캐스트
     */
    @Scheduled(fixedRate = 2000)
    public void streamStockQuotes() {
        if (!socketIoService.isRunning()) return;

        try {
            String sql = """
                SELECT symbol, name, current_price, day_open_price, day_high_price, day_low_price, volume
                FROM stocks
                ORDER BY symbol ASC
                LIMIT 18
                """;

            List<Map<String, Object>> stocks = jdbcTemplate.queryForList(sql);
            if (stocks.isEmpty()) return;

            SocketIOServer server = socketIoService.getServer();
            if (server == null) return;

            // 1. 전역 market:ticks 브로드캐스트 (전체 종목 틱 요약)
            server.getBroadcastOperations().sendEvent("market:ticks", stocks);
            server.getRoomOperations("market").sendEvent("market:ticks", stocks);

            // 2. 종목별 개별 시세 브로드캐스트
            for (Map<String, Object> s : stocks) {
                String symbol = String.valueOf(s.get("symbol"));
                socketIoService.broadcastStockQuote(symbol, s);
            }
        } catch (Exception e) {
            log.debug("[StockMarketSocketStreamer] Error streaming quotes: {}", e.getMessage());
        }
    }
}
