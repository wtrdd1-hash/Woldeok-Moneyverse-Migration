package com.moneyverse.api.domain.identity.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;

@Tag(name = "Admin Security & Session", description = "관리자 보안 콘솔 세션 및 강제 로그아웃/쿠키 초기화 API")
@RestController
public class AdminSecurityController {

    @Value("${moneyverse.security.internal-token:8e5f2a1b9c3d4e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f}")
    private String internalToken;

    @Operation(summary = "관리자 보안 콘솔 세션 상태 및 로그인 정책 조회")
    @GetMapping(path = {
            "/api/v1/admin/security",
            "/api/admin/security"
    })
    public ResponseEntity<?> getSecurityOverview(HttpServletRequest request) {
        String internalHeader = request.getHeader("x-internal-token");
        String authHeader = request.getHeader("Authorization");
        Cookie[] cookies = request.getCookies();

        boolean hasSessionCookie = false;
        if (cookies != null) {
            for (Cookie c : cookies) {
                if ("mv_session".equals(c.getName()) || "__Host-mv_session".equals(c.getName())) {
                    if (c.getValue() != null && !c.getValue().isBlank()) {
                        hasSessionCookie = true;
                        break;
                    }
                }
            }
        }

        // internal token from Next.js server components or valid session
        boolean isAuthorized = (internalHeader != null && internalHeader.equals(internalToken)) ||
                (authHeader != null && authHeader.startsWith("Bearer ")) ||
                hasSessionCookie;

        if (!isAuthorized) {
            Map<String, Object> err = new LinkedHashMap<>();
            err.put("type", "about:blank");
            err.put("title", "Unauthorized");
            err.put("status", 401);
            err.put("detail", "admin session required");
            err.put("code", "login_required");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(err);
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
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("roles", List.of("admin"));
        return ResponseEntity.ok(res);
    }

    @Operation(summary = "관리자 콘솔 세션 진입/로테이션")
    @PostMapping(path = {
            "/api/v1/admin/security/sessions",
            "/api/admin/security/sessions"
    })
    public ResponseEntity<?> openConsoleSession() {
        return ResponseEntity.ok(Map.of("ok", true, "state", "open"));
    }

    @Operation(summary = "관리자 콘솔 세션 종료")
    @DeleteMapping(path = {
            "/api/v1/admin/security/sessions",
            "/api/admin/security/sessions"
    })
    public ResponseEntity<?> closeConsoleSession() {
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
    public ResponseEntity<?> getIpBlocks() {
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
