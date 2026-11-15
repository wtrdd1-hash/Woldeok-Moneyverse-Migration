package com.moneyverse.api.domain.activity.controller;

import com.moneyverse.api.domain.activity.dto.ActivityDtos.*;
import com.moneyverse.api.domain.activity.service.ActivityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Tag(name = "Activity & Telemetry", description = "유저 클라이언트 활동 텔레메트리 수집 및 관리자 트래픽 분석 API")
@RestController
public class ActivityController {

    private final ActivityService activityService;

    public ActivityController(ActivityService activityService) {
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
        UUID userId = resolveUserUuid(xUserId, xActorUserId);
        String ip = request.getRemoteAddr();
        String userAgent = request.getHeader("User-Agent");
        return ResponseEntity.ok(activityService.recordEvents(userId, req.events(), ip, userAgent));
    }

    @GetMapping({"/api/admin/activity/traffic", "/api/v1/admin/activity/traffic"})
    @Operation(summary = "관리자용 트래픽 통계 조회")
    public ResponseEntity<TrafficAnalyticsResponse> traffic(
            @RequestParam(value = "granularity", defaultValue = "day") String granularity,
            @RequestParam(value = "periods", defaultValue = "30") int periods
    ) {
        return ResponseEntity.ok(activityService.trafficDashboard(granularity, periods));
    }

    @GetMapping({"/api/admin/activity/logs", "/api/v1/admin/activity/logs"})
    @Operation(summary = "관리자용 활동 로그 목록 조회")
    public ResponseEntity<ActivityLogsResponse> listLogs(
            @RequestParam(value = "limit", defaultValue = "50") int limit,
            @RequestParam(value = "offset", defaultValue = "0") int offset,
            @RequestParam(value = "userId", required = false) UUID userId
    ) {
        return ResponseEntity.ok(activityService.getLogs(userId, limit, offset));
    }
}
