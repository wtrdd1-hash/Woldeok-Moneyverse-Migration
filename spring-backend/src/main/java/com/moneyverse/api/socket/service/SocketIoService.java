package com.moneyverse.api.socket.service;

import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.SocketIOServer;
import com.moneyverse.api.socket.handler.AuctionSocketHandler;
import com.moneyverse.api.socket.handler.ChatSocketHandler;
import com.moneyverse.api.socket.interceptor.SocketSecurityInterceptor;
import com.moneyverse.api.socket.streamer.AdminMetricSocketStreamer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.SmartLifecycle;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicBoolean;

@Service
public class SocketIoService implements SmartLifecycle {

    private static final Logger log = LoggerFactory.getLogger(SocketIoService.class);

    private final SocketIOServer server;
    private final ChatSocketHandler chatHandler;
    private final AuctionSocketHandler auctionHandler;
    private final AdminMetricSocketStreamer metricStreamer;
    private final SocketSecurityInterceptor securityInterceptor;

    private final AtomicBoolean isRunning = new AtomicBoolean(false);
    private final Map<String, String> clientAppStateMap = new ConcurrentHashMap<>();

    public SocketIoService(
            SocketIOServer server,
            ChatSocketHandler chatHandler,
            AuctionSocketHandler auctionHandler,
            AdminMetricSocketStreamer metricStreamer,
            SocketSecurityInterceptor securityInterceptor
    ) {
        this.server = server;
        this.chatHandler = chatHandler;
        this.auctionHandler = auctionHandler;
        this.metricStreamer = metricStreamer;
        this.securityInterceptor = securityInterceptor;
    }

    @Override
    public void start() {
        if (isRunning.compareAndSet(false, true)) {
            initListeners();
            server.start();
            log.info("[SocketIO] Netty-SocketIO server started successfully on port {}", server.getConfiguration().getPort());
        }
    }

    @Override
    public void stop() {
        if (isRunning.compareAndSet(true, false)) {
            server.stop();
            log.info("[SocketIO] Netty-SocketIO server stopped cleanly");
        }
    }

    @Override
    public boolean isRunning() {
        return isRunning.get();
    }

    private void initListeners() {
        // 스트리머에 서버 바인딩
        metricStreamer.setServer(server);

        // 하위 핸들러 이벤트 등록
        chatHandler.registerListeners(server);
        auctionHandler.registerListeners(server);

        // 1. 클라이언트 연결(Connect) 리스너
        server.addConnectListener(client -> {
            metricStreamer.updateActiveSockets(1);
            int count = metricStreamer.getActiveSocketCount();

            // 전역 접속자 수 브로드캐스트
            server.getBroadcastOperations().sendEvent("online", count);

            // 신규 접속자 로비 권한 부여 응답
            client.sendEvent("lobby:permissions", Map.of("canChat", true));

            log.debug("[SocketIO] Client connected: {} (Active: {})", client.getSessionId(), count);
        });

        // 2. 클라이언트 연결 종료(Disconnect) 리스너
        server.addDisconnectListener(client -> {
            metricStreamer.updateActiveSockets(-1);
            int count = metricStreamer.getActiveSocketCount();
            clientAppStateMap.remove(client.getSessionId().toString());

            // 접속자 수 갱신 브로드캐스트
            server.getBroadcastOperations().sendEvent("online", count);

            log.debug("[SocketIO] Client disconnected: {} (Active: {})", client.getSessionId(), count);
        });

        // 3. 시장(Market) 룸 구독/해제
        server.addEventListener("market:subscribe", Void.class, (client, data, ackSender) -> {
            client.joinRoom("market");
            log.debug("[SocketIO] Client {} joined 'market'", client.getSessionId());
        });

        server.addEventListener("market:unsubscribe", Void.class, (client, data, ackSender) -> {
            client.leaveRoom("market");
            log.debug("[SocketIO] Client {} left 'market'", client.getSessionId());
        });

        // 4. 호가창(Orderbook) 룸 구독/해제
        server.addEventListener("orderbook:subscribe", String.class, (client, symbol, ackSender) -> {
            if (symbol != null && !symbol.isBlank()) {
                client.joinRoom("orderbook:" + symbol);
                log.debug("[SocketIO] Client {} joined 'orderbook:{}'", client.getSessionId(), symbol);
            }
        });

        server.addEventListener("orderbook:unsubscribe", String.class, (client, symbol, ackSender) -> {
            if (symbol != null && !symbol.isBlank()) {
                client.leaveRoom("orderbook:" + symbol);
                log.debug("[SocketIO] Client {} left 'orderbook:{}'", client.getSessionId(), symbol);
            }
        });

        // 5. 개별 주식(Stock) 룸 구독/해제
        server.addEventListener("stock:subscribe", String.class, (client, symbol, ackSender) -> {
            if (symbol != null && !symbol.isBlank()) {
                client.joinRoom("stock:" + symbol);
                log.debug("[SocketIO] Client {} joined 'stock:{}'", client.getSessionId(), symbol);
            }
        });

        server.addEventListener("stock:unsubscribe", String.class, (client, symbol, ackSender) -> {
            if (symbol != null && !symbol.isBlank()) {
                client.leaveRoom("stock:" + symbol);
                log.debug("[SocketIO] Client {} left 'stock:{}'", client.getSessionId(), symbol);
            }
        });

        // 6. 관리자 관제타워(Admin Control Tower) 룸 구독/해제 및 2FA 보안 검증
        server.addEventListener("admin:subscribe", Void.class, (client, data, ackSender) -> {
            if (securityInterceptor.verifyAdminRoomAccess(client.getHandshakeData())) {
                client.joinRoom("admin:control-tower");
                client.sendEvent("admin:authorized", Map.of("status", "SUCCESS", "role", "ROLE_ADMIN"));
                log.info("[SocketIO] Admin client {} joined 'admin:control-tower'", client.getSessionId());
            } else {
                client.sendEvent("admin:error", Map.of("status", "UNAUTHORIZED", "message", "관리자 권한 또는 2FA 인증이 필요합니다."));
                log.warn("[SocketIO] Rejected unauthorized client {} from 'admin:control-tower'", client.getSessionId());
            }
        });

        server.addEventListener("admin:unsubscribe", Void.class, (client, data, ackSender) -> {
            client.leaveRoom("admin:control-tower");
            log.debug("[SocketIO] Admin client {} left 'admin:control-tower'", client.getSessionId());
        });

        // 7. 혁신 기능 1: Adaptive Heartbeat (백그라운드 탭 리소스 절감)
        server.addEventListener("app:state", String.class, (client, state, ackSender) -> {
            if (state != null) {
                clientAppStateMap.put(client.getSessionId().toString(), state);
                log.debug("[AdaptiveHeartbeat] Client {} state set to {}", client.getSessionId(), state);
            }
        });

        // 8. 핑/퐁 레이턴시 텔레메트리
        server.addEventListener("ping:measure", Long.class, (client, clientSendTimestamp, ackSender) -> {
            if (clientSendTimestamp != null) {
                client.sendEvent("pong:measure", Map.of(
                        "clientTimestamp", clientSendTimestamp,
                        "serverTimestamp", System.currentTimeMillis()
                ));
            }
        });
    }

    /**
     * 주식 시세 변동 브로드캐스트
     */
    public void broadcastStockQuote(String symbol, Map<String, Object> quoteData) {
        if (!isRunning.get()) return;
        server.getRoomOperations("stock:" + symbol).sendEvent("stock:quote", quoteData);
        server.getRoomOperations("market").sendEvent("market:quote-update", quoteData);
    }

    /**
     * 호가창 갱신 브로드캐스트
     */
    public void broadcastOrderbook(String symbol, Map<String, Object> orderbookData) {
        if (!isRunning.get()) return;
        server.getRoomOperations("orderbook:" + symbol).sendEvent("orderbook:update", orderbookData);
    }

    public SocketIOServer getServer() {
        return server;
    }
}
