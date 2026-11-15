package com.moneyverse.api.domain.notification.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public class NotificationDtos {

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record NotificationItem(
            UUID id,
            UUID userId,
            String category,
            String title,
            String body,
            String link,
            String dedupeKey,
            boolean isRead,
            OffsetDateTime readAt,
            OffsetDateTime createdAt
    ) {}

    public record NotificationListResponse(
            boolean ok,
            List<NotificationItem> notifications,
            int totalCount,
            int unreadCount
    ) {}

    public record UnreadCountResponse(
            boolean ok,
            int unreadCount
    ) {}

    public record MarkReadResponse(
            boolean ok,
            UUID id,
            boolean isRead
    ) {}

    public record MarkAllReadReceiptResponse(
            boolean ok,
            int markedCount,
            int remainingUnreadCount
    ) {}
}
