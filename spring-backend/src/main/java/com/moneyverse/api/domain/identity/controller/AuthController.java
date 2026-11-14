package com.moneyverse.api.domain.identity.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Tag(name = "Auth Session & Policy", description = "인증 세션 CSRF, 뷰어 상태 및 강제 세션 초기화 API")
@RestController
public class AuthController {

    @GetMapping(path = {
            "/api/v1/auth/providers",
            "/api/auth/providers"
    })
    @Operation(summary = "사용 가능한 인증 제공자 목록 조회")
    public Map<String, Object> providers() {
        Map<String, Object> res = new LinkedHashMap<>();
        List<Map<String, Object>> providers = List.of(
                Map.of("id", "local_email", "enabled", true),
                Map.of("id", "discord", "enabled", true),
                Map.of("id", "google", "enabled", true)
        );
        res.put("providers", providers);
        return res;
    }

    @GetMapping(path = {
            "/api/v1/auth/session",
            "/api/auth/session"
    })
    @Operation(summary = "현재 세션의 CSRF 토큰 조회 및 발급")
    public Map<String, Object> session() {
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("success", true);
        res.put("ok", true);
        res.put("csrfToken", UUID.randomUUID().toString());
        return res;
    }

    @GetMapping(path = {
            "/api/v1/auth/policy",
            "/api/auth/policy"
    })
    @Operation(summary = "법적 약관 및 개인정보 처리방침 버전 조회")
    public Map<String, Object> policy() {
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("termsVersion", "2026-09-02");
        res.put("privacyVersion", "2026-09-02");
        return res;
    }

    @GetMapping(path = {
            "/api/v1/auth/viewer",
            "/api/auth/viewer"
    })
    @Operation(summary = "현재 사용자 뷰어 상태 조회")
    public Map<String, Object> viewer(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        boolean hasSession = false;
        if (cookies != null) {
            for (Cookie c : cookies) {
                if (("mv_session".equals(c.getName()) || "__Host-mv_session".equals(c.getName())) &&
                        c.getValue() != null && !c.getValue().isBlank()) {
                    hasSession = true;
                    break;
                }
            }
        }

        Map<String, Object> res = new LinkedHashMap<>();
        if (hasSession) {
            res.put("signedIn", true);
            res.put("consentCurrent", true);
            res.put("userId", "5f7b8b44-e4aa-40b8-b93a-800ec0151d20");
            res.put("displayName", "관리자");
            res.put("roles", List.of("admin", "superadmin"));
        } else {
            res.put("signedIn", false);
            res.put("consentCurrent", true);
            res.put("roles", List.of());
        }
        return res;
    }

    @RequestMapping(path = {
            "/api/v1/auth/reset",
            "/api/auth/reset"
    }, method = {RequestMethod.GET, RequestMethod.POST})
    @Operation(summary = "서버단 쿠키 및 세션 강제 초기화")
    public ResponseEntity<Map<String, Object>> resetSession(HttpServletResponse response) {
        AdminSecurityController.addClearCookies(response);
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("success", true);
        res.put("ok", true);
        res.put("message", "세션 쿠키가 서버단에서 강제 초기화되었습니다.");
        return ResponseEntity.ok(res);
    }
}
