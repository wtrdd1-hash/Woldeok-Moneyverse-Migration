package com.moneyverse.api.domain.chat.controller;

import com.moneyverse.api.domain.chat.dto.ChatDtos.*;
import com.moneyverse.api.domain.chat.service.ChatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Tag(name = "Direct Chat & Messages", description = "1:1 쪽지 및 실시간 대화방 API")
@RestController
@RequestMapping({"/api/chat", "/api/v1/chat"})
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    private UUID resolveUserUuid(String xUserId, String xActorUserId) {
        String raw = (xUserId != null && !xUserId.isBlank()) ? xUserId.trim()
                : (xActorUserId != null && !xActorUserId.isBlank()) ? xActorUserId.trim()
                : "5f7b8b44-e4aa-40b8-b93a-800ec0151d20";
        try {
            return UUID.fromString(raw);
        } catch (IllegalArgumentException e) {
            return UUID.fromString("5f7b8b44-e4aa-40b8-b93a-800ec0151d20");
        }
    }

    @GetMapping("/conversations")
    @Operation(summary = "내 1:1 대화방 목록 조회")
    public ResponseEntity<ConversationListResponse> listConversations(
            @RequestParam(value = "limit", defaultValue = "50") int limit,
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @RequestHeader(value = "x-actor-user-id", required = false) String xActorUserId
    ) {
        UUID userId = resolveUserUuid(xUserId, xActorUserId);
        return ResponseEntity.ok(chatService.listConversations(userId, limit));
    }

    @GetMapping("/unread-count")
    @Operation(summary = "안 읽은 전체 쪽지 건수 조회")
    public ResponseEntity<ChatUnreadResponse> unreadCount(
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @RequestHeader(value = "x-actor-user-id", required = false) String xActorUserId
    ) {
        UUID userId = resolveUserUuid(xUserId, xActorUserId);
        int unread = chatService.totalUnreadCount(userId);
        return ResponseEntity.ok(new ChatUnreadResponse(true, unread));
    }

    @GetMapping("/conversations/{id}/messages")
    @Operation(summary = "대화방 메시지 이력 조회")
    public ResponseEntity<MessageListResponse> listMessages(
            @PathVariable("id") UUID id,
            @RequestParam(value = "limit", defaultValue = "50") int limit,
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @RequestHeader(value = "x-actor-user-id", required = false) String xActorUserId
    ) {
        UUID userId = resolveUserUuid(xUserId, xActorUserId);
        return ResponseEntity.ok(chatService.listMessages(userId, id, limit));
    }

    @PostMapping("/conversations/{id}/messages")
    @Operation(summary = "대화방에 쪽지 메시지 전송")
    public ResponseEntity<SendMessageResponse> sendMessage(
            @PathVariable("id") UUID id,
            @RequestBody SendMessageRequest req,
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @RequestHeader(value = "x-actor-user-id", required = false) String xActorUserId
    ) {
        UUID userId = resolveUserUuid(xUserId, xActorUserId);
        return ResponseEntity.ok(chatService.sendMessage(userId, id, req));
    }
}
