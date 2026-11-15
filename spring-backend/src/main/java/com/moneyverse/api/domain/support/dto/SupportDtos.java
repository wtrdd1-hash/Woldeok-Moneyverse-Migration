package com.moneyverse.api.domain.support.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public class SupportDtos {

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record SupportThreadItem(
            UUID id,
            UUID userId,
            String subject,
            String status,
            OffsetDateTime createdAt,
            OffsetDateTime updatedAt,
            OffsetDateTime lastMessageAt
    ) {}

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record SupportMessageItem(
            UUID id,
            UUID threadId,
            UUID senderUserId,
            String senderKind,
            String body,
            OffsetDateTime createdAt
    ) {}

    public record ThreadListResponse(
            boolean ok,
            List<SupportThreadItem> threads,
            int totalCount
    ) {}

    public record ThreadSummaryResponse(
            boolean ok,
            int total,
            int open,
            int waitingUser,
            int resolved
    ) {}

    public record MessageListResponse(
            boolean ok,
            List<SupportMessageItem> messages
    ) {}

    public record NewThreadRequest(
            String idempotencyKey,
            String subject,
            String body
    ) {}

    public record NewMessageRequest(
            String idempotencyKey,
            String body
    ) {}

    public record ThreadCreateResponse(
            boolean ok,
            SupportThreadItem thread
    ) {}

    public record MessageCreateResponse(
            boolean ok,
            SupportMessageItem message
    ) {}
}
