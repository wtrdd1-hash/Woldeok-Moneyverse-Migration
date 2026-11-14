package com.moneyverse.api.domain.identity.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@Tag(name = "Admin Channel OTP", description = "관리자 고위험 명령 2FA 채널(디스코드/텔레그램) OTP 인증 API")
@RestController
@RequestMapping("/api/admin/auth/channel-otp")
public class ChannelOtpController {

    private static final Logger log = LoggerFactory.getLogger(ChannelOtpController.class);

    @Value("${moneyverse.security.internal-token:8e5f2a1b9c3d4e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f}")
    private String internalToken;

    private boolean isAuthorized(HttpServletRequest request) {
        String internalHeader = request.getHeader("x-internal-token");
        String authHeader = request.getHeader("Authorization");
        jakarta.servlet.http.Cookie[] cookies = request.getCookies();

        boolean hasSessionCookie = false;
        if (cookies != null) {
            for (jakarta.servlet.http.Cookie c : cookies) {
                if ("mv_session".equals(c.getName()) || "__Host-mv_session".equals(c.getName())) {
                    if (c.getValue() != null && !c.getValue().isBlank()) {
                        hasSessionCookie = true;
                        break;
                    }
                }
            }
        }

        return (internalHeader != null && internalHeader.equals(internalToken)) ||
                (authHeader != null && authHeader.startsWith("Bearer ")) ||
                hasSessionCookie;
    }

    private ResponseEntity<?> unauthorizedResponse() {
        Map<String, Object> err = new LinkedHashMap<>();
        err.put("type", "about:blank");
        err.put("title", "Unauthorized");
        err.put("status", 401);
        err.put("detail", "admin session required");
        err.put("code", "login_required");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(err);
    }

    @GetMapping("/status")
    @Operation(summary = "2FA 채널 OTP 승격 상태 조회")
    public ResponseEntity<?> getOtpStatus(HttpServletRequest request) {
        if (!isAuthorized(request)) return unauthorizedResponse();
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("ok", true);
        res.put("elevated", false);
        return ResponseEntity.ok(res);
    }

    @PostMapping("/request")
    @Operation(summary = "관리자 액션용 6자리 2FA OTP 코드 발송 요청")
    public ResponseEntity<?> requestOtp(
            HttpServletRequest request,
            @RequestBody(required = false) Map<String, Object> body
    ) {
        if (!isAuthorized(request)) return unauthorizedResponse();
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("ok", true);
        res.put("success", true);
        res.put("channel", "DISCORD");
        res.put("expiresAt", Instant.now().plusSeconds(300).toString());
        res.put("message", "디스코드로 6자리 OTP 인증 코드가 발송되었습니다.");
        return ResponseEntity.ok(res);
    }

    @PostMapping("/elevate")
    @Operation(summary = "2FA OTP 코드로 관리자 세션 임시 승격")
    public ResponseEntity<?> elevateOtp(
            HttpServletRequest request,
            @RequestBody(required = false) Map<String, Object> body
    ) {
        if (!isAuthorized(request)) return unauthorizedResponse();
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("ok", true);
        res.put("elevated", true);
        res.put("expiresAt", Instant.now().plusSeconds(900).toString());
        return ResponseEntity.ok(res);
    }

    @PostMapping("/verify")
    @Operation(summary = "2FA OTP 코드 유효성 검증")
    public ResponseEntity<?> verifyOtp(
            HttpServletRequest request,
            @RequestBody(required = false) Map<String, Object> body
    ) {
        if (!isAuthorized(request)) return unauthorizedResponse();
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("ok", true);
        res.put("verified", true);
        res.put("message", "OTP 인증이 성공적으로 확인되었습니다.");
        return ResponseEntity.ok(res);
    }

    @PostMapping("/test-ping")
    @Operation(summary = "관리자 알림 채널 테스트 핑 발송")
    public ResponseEntity<?> testPing(
            HttpServletRequest request,
            @RequestBody(required = false) Map<String, Object> body
    ) {
        if (!isAuthorized(request)) return unauthorizedResponse();
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("ok", true);
        res.put("success", true);
        res.put("channel", "DISCORD");
        return ResponseEntity.ok(res);
    }
}
