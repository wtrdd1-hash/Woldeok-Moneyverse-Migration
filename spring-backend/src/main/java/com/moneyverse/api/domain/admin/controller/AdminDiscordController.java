package com.moneyverse.api.domain.admin.controller;

import com.moneyverse.api.domain.admin.service.AdminAuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@Tag(name = "Admin Discord & Delivery", description = "Session-authorized, actual outbox source events only")
@RestController
@RequestMapping(path = {"/api/v1/admin", "/api/admin", "/admin"})
public class AdminDiscordController {
    private final JdbcTemplate jdbcTemplate;
    private final AdminAuthService adminAuth;

    public AdminDiscordController(JdbcTemplate jdbcTemplate, AdminAuthService adminAuth) {
        this.jdbcTemplate = jdbcTemplate;
        this.adminAuth=adminAuth;
    }

    @Operation(summary = "검증된 관리자만 실제 디스코드 아웃박스 배송 이벤트 조회")
    @GetMapping("/discord-outbox-events")
    public ResponseEntity<Map<String,Object>> getDiscordOutboxEvents(HttpServletRequest request) {
        // Legacy /admin/* JSON aliases do not necessarily run AdminApiBoundaryFilter.
        // Check verified DB role inside this controller as defense in depth.
        if(adminAuth.resolveVerifiedAdminActor(request).isEmpty())
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("ok",false,"code","ADMIN_SESSION_REQUIRED"));

        String sql = """
            SELECT id::text AS event_id, type AS event_type,
                   to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"') AS created_at,
                   to_char(delivered_at AT TIME ZONE 'UTC', 'YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"') AS delivered_at,
                   delivery_attempts, delivery_outcome AS status
            FROM outbox_events
            ORDER BY created_at DESC
            LIMIT 30
            """;
        try {
            List<Map<String,Object>> events=jdbcTemplate.queryForList(sql);
            if(events==null)throw new IllegalStateException("OUTBOX_RESULT_UNKNOWN");
            // Empty source is verified empty; NULL delivery outcome is UNKNOWN, NOT 'delivered'.
            return ResponseEntity.ok(Map.of("events",events));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("ok",false,"code","ADMIN_DISCORD_OUTBOX_SOURCE_UNAVAILABLE"));
        }
    }
}
