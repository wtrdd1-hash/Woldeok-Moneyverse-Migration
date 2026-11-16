package com.moneyverse.api.domain.identity.controller;

import com.moneyverse.api.domain.admin.service.AdminAuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;

@Tag(name = "Admin Security & Session", description = "관리자 보안 콘솔 세션 및 강제 로그아웃/쿠키 초기화 API")
@RestController
public class AdminSecurityController {

    private final AdminAuthService adminAuthService;

    public AdminSecurityController(AdminAuthService adminAuthService) {
        this.adminAuthService = adminAuthService;
    }

    @Operation(summary = "관리자 보안 콘솔 세션 상태 및 로그인 정책 조회")
    @GetMapping(path = {
            "/api/v1/admin/security",
            "/api/admin/security"
    })
    public ResponseEntity<?> getSecurityOverview(HttpServletRequest request) {
        if (!adminAuthService.isAuthorizedAdmin(request)) {
            return adminAuthService.unauthorizedResponse();
        }

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("roles", List.of("admin", "superadmin"));
        res.put("consoleSession", Map.of(
                "state", "open",
                "openedAt", Instant.now().toString(),
                "expiresAt", Instant.now().plusSeconds(86400).toString(),
                "lastActivityAt", Instant.now().toString()
        ));
        res.put("loginPolicy", Map.of(
                "allowlist", List.of()
        ));
        res.put("reauthentication", Map.of(
                "active", true,
                "secondsRemaining", 300
        ));
        return ResponseEntity.ok(res);
    }

    @Operation(summary = "관리자 권한 조회")
    @GetMapping(path = {
            "/api/v1/admin/me",
            "/api/admin/me"
    })
    public ResponseEntity<?> getAdminMe(HttpServletRequest request) {
        if (!adminAuthService.isAuthorizedAdmin(request)) {
            return adminAuthService.unauthorizedResponse();
        }

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("roles", List.of("admin"));
        return ResponseEntity.ok(res);
    }

    @Operation(summary = "관리자 콘솔 세션 진입/로테이션")
    @PostMapping(path = {
            "/api/v1/admin/security/sessions",
            "/api/admin/security/sessions"
    })
    public ResponseEntity<?> openConsoleSession(HttpServletRequest request) {
        if (!adminAuthService.isAuthorizedAdmin(request)) {
            return adminAuthService.unauthorizedResponse();
        }
        return ResponseEntity.ok(Map.of("ok", true, "state", "open"));
    }

    @Operation(summary = "관리자 콘솔 세션 종료")
    @DeleteMapping(path = {
            "/api/v1/admin/security/sessions",
            "/api/admin/security/sessions"
    })
    public ResponseEntity<?> closeConsoleSession(HttpServletRequest request) {
        if (!adminAuthService.isAuthorizedAdmin(request)) {
            return adminAuthService.unauthorizedResponse();
        }
        return ResponseEntity.ok(Map.of("ok", true, "state", "closed"));
    }

    @Operation(summary = "서버단 강제 로그아웃 및 쿠키 전체 소거")
    @PostMapping(path = {
            "/api/v1/admin/security/forced-logouts",
            "/api/admin/security/forced-logouts"
    })
    public ResponseEntity<?> forceLogout(HttpServletResponse response) {
        addClearCookies(response);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "ok", true,
                "message", "세션이 강제 종료되었으며 모든 쿠키가 소거되었습니다."
        ));
    }

    @Operation(summary = "IP 차단 목록 조회")
    @GetMapping(path = {
            "/api/v1/admin/security/ip-blocks",
            "/api/admin/security/ip-blocks"
    })
    public ResponseEntity<?> getIpBlocks(HttpServletRequest request) {
        if (!adminAuthService.isAuthorizedAdmin(request)) {
            return adminAuthService.unauthorizedResponse();
        }
        return ResponseEntity.ok(Map.of("items", List.of()));
    }

    public static void addClearCookies(HttpServletResponse response) {
        List<String> cookieNames = List.of(
                "mv_session",
                "__Host-mv_session",
                "moneyverse_session",
                "wdmv_session",
                "JSESSIONID"
        );
        for (String name : cookieNames) {
            ResponseCookie c1 = ResponseCookie.from(name, "")
                    .path("/")
                    .maxAge(0)
                    .httpOnly(true)
                    .sameSite("Lax")
                    .build();
            response.addHeader(HttpHeaders.SET_COOKIE, c1.toString());

            if (name.startsWith("__Host-")) {
                ResponseCookie cSecure = ResponseCookie.from(name, "")
                        .path("/")
                        .maxAge(0)
                        .httpOnly(true)
                        .secure(true)
                        .sameSite("Lax")
                        .build();
                response.addHeader(HttpHeaders.SET_COOKIE, cSecure.toString());
            }
        }
    }
}
