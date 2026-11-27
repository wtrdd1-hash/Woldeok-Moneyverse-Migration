package com.moneyverse.api.domain.activity.controller;

import com.moneyverse.api.domain.activity.dto.ActivityDtos.*;
import com.moneyverse.api.domain.activity.service.ActivityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@Tag(name = "Activity & Telemetry", description = "유저 클라이언트 활동 텔레메트리 수집 및 관리자 트래픽 분석 API")
@RestController
public class ActivityController {

    private final ActivityService activityService;
    private final com.moneyverse.api.domain.identity.service.UserAuthService auth;
    private final com.moneyverse.api.domain.admin.service.AdminAuthService adminAuth;
    /** One page visit sends a handful of events; a larger batch is abuse (security review 2026-11-25). */
    public static final int MAX_EVENTS = 50;

    public ActivityController(ActivityService activityService, com.moneyverse.api.domain.identity.service.UserAuthService auth,
                              com.moneyverse.api.domain.admin.service.AdminAuthService adminAuth) {
        this.adminAuth = adminAuth;
        this.auth = auth;
        this.activityService = activityService;
    }

    private UUID resolveUserUuid(String xUserId, String xActorUserId) {
        String raw = (xUserId != null && !xUserId.isBlank()) ? xUserId.trim()
                : (xActorUserId != null && !xActorUserId.isBlank()) ? xActorUserId.trim()
                : null;
        if (raw == null) return null;
        try {
            return UUID.fromString(raw);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    @PostMapping({"/api/activity/events", "/api/v1/activity/events"})
    @Operation(summary = "클라이언트 활동 이벤트 수집")
    public ResponseEntity<IngestEventsResponse> ingestEvents(
            @RequestBody IngestActivityEventsRequest req,
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @RequestHeader(value = "x-actor-user-id", required = false) String xActorUserId,
            HttpServletRequest request
    ) {
        // Identity comes from the session only; identity headers are ignored (anyone can send them).
        if (req == null || req.events() == null || req.events().size() > MAX_EVENTS) {
            return ResponseEntity.badRequest().body(new IngestEventsResponse(false, 0));
        }
        UUID userId = auth.resolveSession(request)
                .filter(com.moneyverse.api.domain.identity.service.UserAuthService.SessionInfo::isSignedIn)
                .map(com.moneyverse.api.domain.identity.service.UserAuthService.SessionInfo::getUserId)
                .orElse(null);
        String ip = request.getRemoteAddr();
        String userAgent = request.getHeader("User-Agent");
        return ResponseEntity.ok(activityService.recordEvents(userId, req.events(), ip, userAgent));
    }

    // Administrator reads: the boundary filter admits verified administrators; the functions check
    // the role again and the actor passed is the verified one, never a header.
    @GetMapping({"/api/admin/activity/traffic", "/api/v1/admin/activity/traffic"})
    @Operation(summary = "Administrator traffic statistics")
    public ResponseEntity<Map<String, Object>> traffic(HttpServletRequest request,
            @RequestParam(value = "granularity", defaultValue = "day") String granularity,
            @RequestParam(value = "periods", defaultValue = "30") int periods) {
        return ResponseEntity.ok(activityService.adminTraffic(admin(request), granularity, periods));
    }

    @GetMapping("/api/admin/activity/logs")
    @Operation(summary = "Administrator activity log (legacy envelope)")
    public ResponseEntity<Map<String, Object>> listLogs(HttpServletRequest request,
            @RequestParam(value = "limit", defaultValue = "50") int limit,
            @RequestParam(value = "offset", defaultValue = "0") int offset,
            @RequestParam(value = "userId", required = false) UUID userId) {
        var items = activityService.adminLogs(admin(request), userId, null, limit, offset);
        return ResponseEntity.ok(Map.of("ok", true, "items", items, "count", items.size()));
    }

    @GetMapping("/api/v1/admin/activity/logs")
    @Operation(summary = "Administrator activity log (bare array for the web)")
    public ResponseEntity<List<Map<String, Object>>> listLogsV1(HttpServletRequest request,
            @RequestParam(value = "limit", defaultValue = "50") int limit,
            @RequestParam(value = "offset", defaultValue = "0") int offset,
            @RequestParam(value = "userId", required = false) UUID userId,
            @RequestParam(value = "eventType", required = false) String eventType) {
        return ResponseEntity.ok(activityService.adminLogs(admin(request), userId, eventType, limit, offset));
    }

    private UUID admin(HttpServletRequest request) {
        return adminAuth.resolveVerifiedAdminActor(request).orElse(null);
    }
}
