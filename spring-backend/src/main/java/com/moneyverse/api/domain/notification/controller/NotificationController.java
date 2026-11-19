package com.moneyverse.api.domain.notification.controller;

import com.moneyverse.api.domain.notification.dto.NotificationDtos.*;
import com.moneyverse.api.domain.notification.service.NotificationService;
import com.moneyverse.api.domain.identity.service.MemberApiGuard;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@Tag(name = "Notification System", description = "Verified owner's in-app notifications")
@RestController
@RequestMapping({"/api/notifications", "/api/v1/notifications"})
public class NotificationController {
    private final NotificationService notificationService;
    private final MemberApiGuard memberApiGuard;

    public NotificationController(NotificationService notificationService, MemberApiGuard memberApiGuard) {
        this.notificationService = notificationService;
        this.memberApiGuard = memberApiGuard;
    }

    @GetMapping({"", "/"})
    @Operation(summary = "Authenticated owner's notifications")
    public ResponseEntity<NotificationListResponse> listNotifications(HttpServletRequest request,
            @RequestParam(value = "limit", defaultValue = "50") int limit,
            @RequestParam(value = "unreadOnly", defaultValue = "false") boolean unreadOnly) {
        return ResponseEntity.ok(notificationService.listNotifications(memberApiGuard.actor(request), limit, unreadOnly));
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Authenticated owner's unread notification count")
    public ResponseEntity<UnreadCountResponse> unreadCount(HttpServletRequest request) {
        int unread = notificationService.unreadCount(memberApiGuard.actor(request));
        return ResponseEntity.ok(new UnreadCountResponse(true, unread));
    }

    @PostMapping("/{id}/read")
    @Operation(summary = "CSRF-bound owner notification read state")
    public ResponseEntity<MarkReadResponse> markRead(HttpServletRequest request, @PathVariable("id") UUID id) {
        return ResponseEntity.ok(notificationService.markRead(memberApiGuard.verifiedMutationActor(request), id));
    }

    @PostMapping({"/read-all", "/read-all-receipt"})
    @Operation(summary = "CSRF-bound owner all-read receipt")
    public ResponseEntity<MarkAllReadReceiptResponse> markAllRead(HttpServletRequest request) {
        return ResponseEntity.ok(notificationService.markAllReadWithReceipt(memberApiGuard.verifiedMutationActor(request)));
    }
}
