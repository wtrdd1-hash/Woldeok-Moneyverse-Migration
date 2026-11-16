package com.moneyverse.api.socket.handler;

import com.corundumstudio.socketio.SocketIOServer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class AuctionSocketHandler {

    private static final Logger log = LoggerFactory.getLogger(AuctionSocketHandler.class);
    private SocketIOServer server;

    public void registerListeners(SocketIOServer server) {
        this.server = server;

        server.addEventListener("auction:subscribe", String.class, (client, auctionId, ackSender) -> {
            if (auctionId != null && !auctionId.isBlank()) {
                client.joinRoom("auction:" + auctionId);
                log.debug("[Auction] Client {} subscribed to auction:{}", client.getSessionId(), auctionId);
            }
        });

        server.addEventListener("auction:unsubscribe", String.class, (client, auctionId, ackSender) -> {
            if (auctionId != null && !auctionId.isBlank()) {
                client.leaveRoom("auction:" + auctionId);
                log.debug("[Auction] Client {} unsubscribed from auction:{}", client.getSessionId(), auctionId);
            }
        });
    }

    /**
     * 경매 실시간 신규 입찰 브로드캐스트
     */
    public void broadcastBid(Map<String, Object> payload) {
        if (server == null) return;
        String auctionId = String.valueOf(payload.get("auctionId"));
        server.getRoomOperations("auction:" + auctionId).sendEvent("auction:bid", payload);
        server.getBroadcastOperations().sendEvent("market:auction-pulse", payload);
        log.info("[Auction] Broadcasted bid for auction {}: {} WLD", auctionId, payload.get("bidAmount"));
    }

    /**
     * 마감 직전 스나이핑 방지 시간 자동 연장 브로드캐스트
     */
    public void broadcastAntiSnipingExtended(Map<String, Object> payload) {
        if (server == null) return;
        String auctionId = String.valueOf(payload.get("auctionId"));
        server.getRoomOperations("auction:" + auctionId).sendEvent("auction:anti-sniping", payload);
        log.info("[Auction] Broadcasted anti-sniping extension for auction {} -> {}", auctionId, payload.get("newEndsAt"));
    }

    /**
     * 자동 대리 입찰 브로드캐스트
     */
    public void broadcastProxyBid(Map<String, Object> payload) {
        if (server == null) return;
        String auctionId = String.valueOf(payload.get("auctionId"));
        server.getRoomOperations("auction:" + auctionId).sendEvent("auction:proxy-bid", payload);
        log.info("[Auction] Broadcasted proxy bid for auction {}: {} WLD", auctionId, payload.get("autoBidAmount"));
    }

    /**
     * 이전 최고 입찰자 대상 상회 입찰(Outbid) 알림 브로드캐스트
     */
    public void broadcastOutbid(Map<String, Object> payload) {
        if (server == null) return;
        String auctionId = String.valueOf(payload.get("auctionId"));
        server.getRoomOperations("auction:" + auctionId).sendEvent("auction:outbid", payload);
        log.info("[Auction] Broadcasted outbid notification for auction {}", auctionId);
    }
}
