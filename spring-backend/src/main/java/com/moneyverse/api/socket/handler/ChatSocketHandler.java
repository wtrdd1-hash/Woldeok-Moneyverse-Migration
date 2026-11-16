package com.moneyverse.api.socket.handler;

import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.SocketIOServer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Component
public class ChatSocketHandler {

    private static final Logger log = LoggerFactory.getLogger(ChatSocketHandler.class);

    public void registerListeners(SocketIOServer server) {
        // 일반 채팅 메시지 수신 및 브로드캐스트
        server.addEventListener("chat:send", Map.class, (client, data, ackSender) -> {
            try {
                String room = (String) data.getOrDefault("room", "lobby");
                String senderName = (String) data.getOrDefault("senderName", "익명");
                String message = (String) data.getOrDefault("message", "");

                if (message == null || message.trim().isEmpty()) {
                    return;
                }

                Map<String, Object> payload = Map.of(
                        "id", UUID.randomUUID().toString(),
                        "room", room,
                        "senderName", senderName,
                        "message", message.trim(),
                        "timestamp", Instant.now().toString()
                );

                // 해당 방으로 브로드캐스트 (전체 방인 경우 전체 전송)
                if ("lobby".equalsIgnoreCase(room)) {
                    server.getBroadcastOperations().sendEvent("chat:message", payload);
                } else {
                    server.getRoomOperations(room).sendEvent("chat:message", payload);
                }

                log.debug("[Chat] Broadcasted message to room '{}' from '{}'", room, senderName);
            } catch (Exception e) {
                log.error("[Chat] Error processing chat:send: {}", e.getMessage(), e);
            }
        });

        // 채팅 룸 참여/퇴장
        server.addEventListener("chat:join", String.class, (client, room, ackSender) -> {
            if (room != null && !room.isBlank()) {
                client.joinRoom(room);
                log.debug("[Chat] Client {} joined room {}", client.getSessionId(), room);
            }
        });

        server.addEventListener("chat:leave", String.class, (client, room, ackSender) -> {
            if (room != null && !room.isBlank()) {
                client.leaveRoom(room);
                log.debug("[Chat] Client {} left room {}", client.getSessionId(), room);
            }
        });
    }
}
