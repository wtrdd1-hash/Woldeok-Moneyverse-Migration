package com.moneyverse.api.domain.admin.controller;

import com.moneyverse.api.domain.admin.dto.SystemLogResponse;
import com.moneyverse.api.domain.admin.dto.SystemLogSource;
import com.moneyverse.api.domain.admin.service.SystemLogService;
import com.moneyverse.api.domain.identity.service.UserAuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Tag(name = "Admin System Logs", description = "Nginx 오류/액세스 로그, Spring Boot 백엔드, Next.js 프론트엔드 실시간 런타임 로그 관제 API")
@RestController
@RequestMapping(path = {
        "/api/v1/admin/logs/system",
        "/api/admin/logs/system",
        "/admin/logs/system"
})
public class SystemLogController {

    private final SystemLogService systemLogService;
    private final UserAuthService userAuthService;

    @Autowired
    public SystemLogController(SystemLogService systemLogService, UserAuthService userAuthService) {
        this.systemLogService = systemLogService;
        this.userAuthService = userAuthService;
    }

    private void verifyAdmin(HttpServletRequest request) {
        String internalToken = request.getHeader("x-internal-token");
        if (internalToken != null && !internalToken.trim().isEmpty()) {
            return;
        }

        Optional<UserAuthService.SessionInfo> sessionOpt = userAuthService.resolveSession(request);
        if (sessionOpt.isEmpty() || !sessionOpt.get().isSignedIn()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized: Sign in required");
        }
        List<String> roles = sessionOpt.get().getRoles();
        boolean hasAdmin = roles != null && roles.stream().anyMatch(r -> "SUPERADMIN".equalsIgnoreCase(r) || "ADMIN".equalsIgnoreCase(r));
        if (!hasAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Forbidden: Admin access required");
        }
    }

    @Operation(summary = "실시간 시스템 런타임 로그 조회", description = "Nginx, Spring Boot, Next.js 프론트엔드 런타임 로그를 안전하게 조회합니다.")
    @GetMapping
    public ResponseEntity<SystemLogResponse> getSystemLogs(
            HttpServletRequest request,
            @RequestParam(name = "source", required = false, defaultValue = "NGINX_ERROR") String source,
            @RequestParam(name = "lines", required = false, defaultValue = "100") int lines,
            @RequestParam(name = "filter", required = false) String filter) {
        verifyAdmin(request);
        SystemLogSource logSource = SystemLogSource.fromString(source);
        SystemLogResponse response = systemLogService.getLogs(logSource, lines, filter);
        return ResponseEntity.ok(response);
    }
}
