package com.moneyverse.api.socket.handler;

import com.corundumstudio.socketio.SocketIOServer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.regex.Pattern;

/**
 * Legacy socket chat events. Security 2026-11-26: chat:join joined any room name (including the
 * admin control-tower room) and chat:send broadcast to any room under a client-chosen sender
 * name with no identity. The frontend uses neither (member chat goes through the REST API with
 * session and CSRF), so chat:send is refused and chat:join is limited to public feed rooms.
 */
@Component
public class ChatSocketHandler {

    private static final Logger log = LoggerFactory.getLogger(ChatSocketHandler.class);
    private static final Pattern PUBLIC_ROOM = Pattern.compile(
            "^(lobby|market|stock:[A-Za-z0-9_.-]{1,24}|orderbook:[A-Za-z0-9_.-]{1,24}|auction:[0-9a-fA-F-]{36})$");

    public static boolean isPublicRoom(String room) {
        return room != null && PUBLIC_ROOM.matcher(room).matches();
    }

    public void registerListeners(SocketIOServer server) {
        server.addEventListener("chat:send", Map.class, (client, data, ackSender) ->
                client.sendEvent("message:error", Map.of("code", "CHAT_SOCKET_SEND_DISABLED",
                        "message", "Chat messages are sent through the signed-in chat API.")));

        server.addEventListener("chat:join", String.class, (client, room, ackSender) -> {
            if (isPublicRoom(room)) {
                client.joinRoom(room);
            } else {
                log.warn("[Chat] refused join to non-public room from {}", client.getSessionId());
                client.sendEvent("message:error", Map.of("code", "ROOM_NOT_PUBLIC"));
            }
        });

        server.addEventListener("chat:leave", String.class, (client, room, ackSender) -> {
            if (room != null && !room.isBlank()) client.leaveRoom(room);
        });
    }
}
