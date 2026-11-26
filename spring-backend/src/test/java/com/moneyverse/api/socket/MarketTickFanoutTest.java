package com.moneyverse.api.socket;

import com.corundumstudio.socketio.BroadcastOperations;
import com.corundumstudio.socketio.SocketIOServer;
import com.moneyverse.api.socket.service.SocketIoService;
import com.moneyverse.api.socket.streamer.StockMarketSocketStreamer;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.*;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Capacity sandbox 2026-11-26: every market subscriber received each market:ticks twice (one
 * broadcast to all sockets, one to the market room), 30 ticks per 30 s instead of 15. Every
 * client subscribes first (web site-socket, use-market-prices, legacy live-init, the Android
 * RealtimeMarketClient), so the room send is the delivery path and the global one is waste,
 * and also reached sockets that never asked for prices.
 */
class MarketTickFanoutTest {
    @Test void ticksGoToTheMarketRoomOnceAndNotToEverySocket() {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        Map<String, Object> row = new HashMap<>(Map.of("symbol", "WDM", "current_price", 110L, "day_open_price", 100L));
        when(jdbc.queryForList(anyString())).thenReturn(List.of(row));
        SocketIOServer server = mock(SocketIOServer.class);
        BroadcastOperations all = mock(BroadcastOperations.class), room = mock(BroadcastOperations.class);
        when(server.getBroadcastOperations()).thenReturn(all);
        when(server.getRoomOperations(anyString())).thenReturn(mock(BroadcastOperations.class));
        when(server.getRoomOperations("market")).thenReturn(room);
        SocketIoService sockets = mock(SocketIoService.class);
        when(sockets.isRunning()).thenReturn(true);
        when(sockets.getServer()).thenReturn(server);

        new StockMarketSocketStreamer(jdbc, sockets).streamStockQuotes();

        verify(room, times(1)).sendEvent(eq("market:ticks"), any(Object[].class));
        verify(all, never()).sendEvent(eq("market:ticks"), any(Object[].class));
    }
}
