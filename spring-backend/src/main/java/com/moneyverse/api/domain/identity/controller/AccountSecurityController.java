package com.moneyverse.api.domain.identity.controller;

import com.moneyverse.api.domain.identity.service.AccountSecurityService;
import com.moneyverse.api.domain.identity.service.UserAuthService;
import com.moneyverse.api.domain.identity.service.UserAuthService.SessionInfo;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Tag(name = "Account Security", description = "활성 세션 목록 조회, 세션 강제 만료 및 보안 감사 이벤트 API")
@RestController
public class AccountSecurityController {

    private final UserAuthService authService;
    private final AccountSecurityService securityService;

    public AccountSecurityController(UserAuthService authService, AccountSecurityService securityService) {
        this.authService = authService;
        this.securityService = securityService;
    }

    private Optional<SessionInfo> requireAuth(HttpServletRequest request) {
        Optional<SessionInfo> session = authService.resolveSession(request);
        if (session.isPresent() && session.get().isSignedIn()) {
            return session;
        }
        return Optional.empty();
    }

    @GetMapping(path = {
            "/api/v1/account/security/sessions",
            "/api/account/security/sessions"
    })
    @Operation(summary = "현재 사용자 본인의 활성 세션 목록 조회")
    public ResponseEntity<?> listSessions(HttpServletRequest request) {
        Optional<SessionInfo> session = requireAuth(request);
        if (session.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("detail", "login required"));
        }

        var sessions = securityService.getActiveSessions(session.get().getUserId(), session.get().getSessionId());
        return ResponseEntity.ok(Map.of("sessions", sessions));
    }

    @GetMapping(path = {
            "/api/v1/account/security/events",
            "/api/account/security/events"
    })
    @Operation(summary = "최근 보안 이벤트 로그 조회")
    public ResponseEntity<?> listSecurityEvents(
            HttpServletRequest request,
            @RequestParam(value = "category", required = false, defaultValue = "all") String category,
            @RequestParam(value = "sort", required = false, defaultValue = "recent") String sort) {
        Optional<SessionInfo> session = requireAuth(request);
        if (session.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("detail", "login required"));
        }

        var events = securityService.getSecurityEvents(session.get().getUserId(), category, sort);
        return ResponseEntity.ok(Map.of("events", events));
    }

    @DeleteMapping(path = {
            "/api/v1/account/security/sessions/{id}",
            "/api/account/security/sessions/{id}"
    })
    @Operation(summary = "지정된 다른 기기의 활성 세션 해제")
    public ResponseEntity<?> revokeSession(
            HttpServletRequest request,
            @PathVariable("id") String targetSessionId) {
        Optional<SessionInfo> session = requireAuth(request);
        if (session.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("detail", "login required"));
        }

        try {
            UUID target = UUID.fromString(targetSessionId);
            boolean revoked = securityService.revokeOtherSession(session.get().getUserId(), session.get().getSessionId(), target);
            return ResponseEntity.ok(Map.of("revoked", revoked));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "invalid session UUID"));
        }
    }

    @PostMapping(path = {
            "/api/v1/account/security/sessions/revoke-others",
            "/api/account/security/sessions/revoke-others"
    })
    @Operation(summary = "현재 세션을 제외한 다른 모든 기기의 세션 일괄 해제")
    public ResponseEntity<?> revokeOtherSessions(HttpServletRequest request) {
        Optional<SessionInfo> session = requireAuth(request);
        if (session.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("detail", "login required"));
        }

        int count = securityService.revokeOtherSessions(session.get().getUserId(), session.get().getSessionId());
        return ResponseEntity.ok(Map.of("revokedSessions", count));
    }
}
