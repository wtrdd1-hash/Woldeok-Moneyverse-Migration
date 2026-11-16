package com.moneyverse.api.domain.admin.controller;

import com.moneyverse.api.domain.admin.dto.SystemLogResponse;
import com.moneyverse.api.domain.admin.dto.SystemLogSource;
import com.moneyverse.api.domain.admin.service.SystemLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
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
    private final AdminLogIdentityResolver identityResolver;
    private final AdminLogConsoleGate consoleGate;

    @Autowired
    public SystemLogController(SystemLogService systemLogService, AdminLogIdentityResolver identityResolver,
                               AdminLogConsoleGate consoleGate) {
        this.systemLogService = systemLogService;
        this.identityResolver = identityResolver;
        this.consoleGate = consoleGate;
    }

    private void verifyAdmin(HttpServletRequest request) {
        Optional<AdminLogIdentityResolver.VerifiedSession> sessionOpt = identityResolver.resolve(request);
        if (sessionOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized: Sign in required");
        }
        List<String> roles = sessionOpt.get().roles();
        boolean hasAdmin = roles != null && roles.stream().anyMatch(r -> "SUPERADMIN".equalsIgnoreCase(r));
        if (!hasAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Forbidden: Superadmin required");
        }
        if (!consoleGate.isOpen(sessionOpt.get().sessionId(), sessionOpt.get().userId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Forbidden: Admin console session required");
        }
    }

    @Operation(summary = "실시간 시스템 런타임 로그 조회", description = "Nginx, Spring Boot, Next.js 프론트엔드 런타임 로그를 안전하게 조회합니다.")
    @GetMapping
    public ResponseEntity<SystemLogResponse> getSystemLogs(
            HttpServletRequest request,
            HttpServletResponse servletResponse,
            @RequestParam(name = "source", required = false, defaultValue = "NGINX_ERROR") String source,
            @RequestParam(name = "lines", required = false, defaultValue = "100") int lines,
            @RequestParam(name = "filter", required = false) String filter) {
        servletResponse.setHeader("Cache-Control", "private, no-store");
        servletResponse.setHeader("X-Robots-Tag", "noindex, nofollow");
        servletResponse.setHeader("Referrer-Policy", "no-referrer");
        verifyAdmin(request);
        if (lines < 1 || lines > 500) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid log line count");
        }
        final SystemLogSource logSource;
        try {
            logSource = SystemLogSource.fromString(source);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown log source");
        }
        final SystemLogResponse response;
        try {
            response = systemLogService.getLogs(logSource, lines, filter);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid log filter");
        }
        return ResponseEntity.ok(response);
    }
}
