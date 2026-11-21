package com.moneyverse.api.domain.admin.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentLinkedDeque;

@Tag(name = "Frontend Audit Logs", description = "프론트엔드 화면 로드 실패 및 런타임 오류 전수 수집/진단 API")
@RestController
public class FrontendAuditController {

    private static final Logger log = LoggerFactory.getLogger(FrontendAuditController.class);

    private final JdbcTemplate jdbcTemplate;
    private final ConcurrentLinkedDeque<Map<String, Object>> recentErrors = new ConcurrentLinkedDeque<>();
    private static final int MAX_IN_MEMORY_LOGS = 100;

    public FrontendAuditController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    /**
     * 프론트엔드 화면 로드 예외 및 에러 원인 실시간 수집
     */
    @Operation(summary = "프론트엔드 화면 로드 오류 수집 및 시스템 로그 영구 기록")
    @PostMapping(path = {
            "/api/v1/audit/frontend-errors",
            "/api/audit/frontend-errors"
    })
    public ResponseEntity<Map<String, Object>> reportFrontendError(
            @RequestBody(required = false) Map<String, Object> body,
            HttpServletRequest request
    ) {
        if (body == null) body = Collections.emptyMap();

        String errorId = String.valueOf(body.getOrDefault("id", UUID.randomUUID().toString()));
        String path = String.valueOf(body.getOrDefault("path", request.getHeader("Referer")));
        String errorName = String.valueOf(body.getOrDefault("errorName", "UnknownError"));
        String errorMessage = String.valueOf(body.getOrDefault("errorMessage", "No message"));
        String digest = String.valueOf(body.getOrDefault("digest", ""));
        Object errorStack = body.get("errorStack");
        Object cachedUser = body.get("cachedUser");
        String ip = request.getRemoteAddr();

        // 1. Spring Boot 시스템 저널 로그에 ERROR 레벨로 상세 원인 영구 기록
        log.error("[FRONTEND_SCREEN_LOAD_ERROR] ID='{}', Path='{}', Name='{}', Message='{}', Digest='{}', User='{}', IP='{}'\nStack: {}",
                errorId, path, errorName, errorMessage, digest, cachedUser, ip, errorStack);

        // 2. 인메모리 최근 오류 큐 보존 (관리자 화면 실시간 진단용)
        Map<String, Object> record = new LinkedHashMap<>(body);
        record.put("receivedAt", Instant.now().toString());
        record.put("clientIp", ip);
        recentErrors.addFirst(record);
        while (recentErrors.size() > MAX_IN_MEMORY_LOGS) {
            recentErrors.pollLast();
        }

        // 3. 감사 로그 DB 기록 시도 (선택적)
        try {
            jdbcTemplate.update(
                    "INSERT INTO system_audit_logs (action, target_type, target_id, details, ip_address, created_at) " +
                    "VALUES ('FRONTEND_SCREEN_LOAD_ERROR', 'PAGE_ERROR', ?, ?::jsonb, ?, NOW())",
                    errorId,
                    String.format("{\"path\":\"%s\",\"error\":\"%s\",\"digest\":\"%s\"}",
                            path.replace("\"", "\\\""), errorMessage.replace("\"", "\\\""), digest),
                    ip
            );
        } catch (Exception ignored) {
            // DB 테이블 스키마 차이가 있더라도 메모리 및 시스템 로그에는 100% 보존됨
        }

        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("ok", true);
        res.put("id", errorId);
        res.put("recordedAt", Instant.now().toString());
        return ResponseEntity.ok(res);
    }

    /**
     * 최근 수집된 프론트엔드 오류 목록 조회 (관리자용)
     */
    @Operation(summary = "수집된 최근 프론트엔드 오류 목록 조회")
    @GetMapping(path = {
            "/api/v1/audit/frontend-errors",
            "/api/audit/frontend-errors",
            "/api/v1/admin/logs/frontend-errors"
    })
    public ResponseEntity<Map<String, Object>> getRecentFrontendErrors() {
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("success", true);
        res.put("ok", true);
        res.put("totalCount", recentErrors.size());
        res.put("errors", new ArrayList<>(recentErrors));
        return ResponseEntity.ok(res);
    }
}
