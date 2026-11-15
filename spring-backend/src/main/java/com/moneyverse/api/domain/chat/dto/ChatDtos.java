package com.moneyverse.api.domain.chat.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public class ChatDtos {

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record ConversationItem(
            UUID id,
            UUID peerUserId,
            String peerNickname,
            String lastMessage,
            int unreadCount,
            OffsetDateTime updatedAt
    ) {}

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record ChatMessageItem(
            UUID id,
            UUID conversationId,
            UUID senderUserId,
            String body,
            long sequence,
            OffsetDateTime createdAt
    ) {}

    public record ConversationListResponse(
            boolean ok,
            List<ConversationItem> conversations,
            int totalUnread
    ) {}

    public record MessageListResponse(
            boolean ok,
            List<ChatMessageItem> messages
    ) {}

    public record ChatUnreadResponse(
            boolean ok,
            int totalUnread
    ) {}

    public record OpenConversationRequest(
            UUID peerUserId
    ) {}

    public record SendMessageRequest(
            String body,
            String idempotencyKey
    ) {}

    public record MarkReadRequest(
            String sequence
    ) {}

    public record SendMessageResponse(
            boolean ok,
            ChatMessageItem message
    ) {}
}
