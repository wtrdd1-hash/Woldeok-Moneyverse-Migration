package com.moneyverse.api.domain.notification.controller;

import com.moneyverse.api.domain.notification.dto.NotificationDtos.*;
import com.moneyverse.api.domain.notification.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Tag(name = "Notification System", description = "인앱 알림 조회, 읽음 처리 및 미확인 알림 카운트 API")
@RestController
@RequestMapping({"/api/notifications", "/api/v1/notifications"})
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
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

    @GetMapping({"", "/"})
    @Operation(summary = "내 인앱 알림 목록 조회")
    public ResponseEntity<NotificationListResponse> listNotifications(
            @RequestParam(value = "limit", defaultValue = "50") int limit,
            @RequestParam(value = "unreadOnly", defaultValue = "false") boolean unreadOnly,
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @RequestHeader(value = "x-actor-user-id", required = false) String xActorUserId
    ) {
        UUID userId = resolveUserUuid(xUserId, xActorUserId);
        return ResponseEntity.ok(notificationService.listNotifications(userId, limit, unreadOnly));
    }

    @GetMapping("/unread-count")
    @Operation(summary = "미확인 알림 건수 조회")
    public ResponseEntity<UnreadCountResponse> unreadCount(
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @RequestHeader(value = "x-actor-user-id", required = false) String xActorUserId
    ) {
        UUID userId = resolveUserUuid(xUserId, xActorUserId);
        int unread = notificationService.unreadCount(userId);
        return ResponseEntity.ok(new UnreadCountResponse(true, unread));
    }

    @PostMapping("/{id}/read")
    @Operation(summary = "특정 알림 읽음 처리")
    public ResponseEntity<MarkReadResponse> markRead(
            @PathVariable("id") UUID id,
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @RequestHeader(value = "x-actor-user-id", required = false) String xActorUserId
    ) {
        UUID userId = resolveUserUuid(xUserId, xActorUserId);
        return ResponseEntity.ok(notificationService.markRead(userId, id));
    }

    @PostMapping({"/read-all", "/read-all-receipt"})
    @Operation(summary = "모든 알림 읽음 처리 및 영수증 확인")
    public ResponseEntity<MarkAllReadReceiptResponse> markAllRead(
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @RequestHeader(value = "x-actor-user-id", required = false) String xActorUserId
    ) {
        UUID userId = resolveUserUuid(xUserId, xActorUserId);
        return ResponseEntity.ok(notificationService.markAllReadWithReceipt(userId));
    }
}
