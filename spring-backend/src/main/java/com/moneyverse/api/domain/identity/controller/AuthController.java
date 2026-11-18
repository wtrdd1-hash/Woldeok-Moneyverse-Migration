package com.moneyverse.api.domain.identity.controller;

import com.moneyverse.api.domain.identity.service.UserAuthService;
import com.moneyverse.api.domain.identity.service.UserAuthService.PreloginSessionResult;
import com.moneyverse.api.domain.identity.service.UserAuthService.SessionInfo;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Tag(name = "Auth Session & Policy", description = "인증 세션 CSRF, 뷰어 상태 및 세션 초기화 API")
@RestController
public class AuthController {

    private final UserAuthService authService;

    public AuthController(UserAuthService authService) {
        this.authService = authService;
    }

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
    @Operation(summary = "현재 세션의 CSRF 토큰 조회 및 로그인 상태 반환")
    public Map<String, Object> session(HttpServletRequest request) {
        Optional<SessionInfo> session = authService.resolveSession(request);
        Map<String, Object> res = new LinkedHashMap<>();
        boolean signedIn = session.isPresent() && session.get().isSignedIn();
        res.put("success", true);
        res.put("ok", true);
        res.put("authenticated", signedIn);
        res.put("signedIn", signedIn);
        res.put("csrfToken", session.map(SessionInfo::getCsrfHash).orElse(UUID.randomUUID().toString()));
        if (signedIn) {
            SessionInfo s = session.get();
            Map<String, Object> u = new LinkedHashMap<>();
            u.put("id", s.getUserId().toString());
            u.put("userId", s.getUserId().toString());
            u.put("username", s.getDisplayName() != null ? s.getDisplayName() : "회원");
            u.put("name", s.getDisplayName() != null ? s.getDisplayName() : "회원");
            u.put("displayName", s.getDisplayName() != null ? s.getDisplayName() : "회원");
            u.put("email", s.getEmail());
            u.put("roles", s.getRoles());
            res.put("user", u);
        } else {
            res.put("user", null);
        }
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
    @Operation(summary = "현재 사용자 뷰어 상태 조회 (DB 세션 직통)")
    public Map<String, Object> viewer(HttpServletRequest request) {
        Optional<SessionInfo> session = authService.resolveSession(request);
        Map<String, Object> res = new LinkedHashMap<>();

        if (session.isPresent() && session.get().isSignedIn()) {
            SessionInfo s = session.get();
            res.put("signedIn", true);
            res.put("consentCurrent", true);
            res.put("userId", s.getUserId().toString());
            res.put("displayName", s.getDisplayName() != null ? s.getDisplayName() : "시민");
            res.put("email", s.getEmail());
            res.put("roles", s.getRoles());
            res.put("adminRoles", s.getRoles().stream().filter(r -> r != null && r.toLowerCase().contains("admin")).toList());
        } else {
            res.put("signedIn", false);
            res.put("consentCurrent", true);
            res.put("roles", List.of());
            res.put("adminRoles", List.of());
        }
        return res;
    }

    @PostMapping(path = {
            "/api/v1/auth/prelogin-session",
            "/api/auth/prelogin-session"
    })
    @Operation(summary = "사전 로그인 세션 생성 및 CSRF 토큰 발급")
    public Map<String, Object> preloginSession(
            HttpServletRequest request,
            HttpServletResponse response) {
        Optional<SessionInfo> existing = authService.resolveSession(request);
        if (existing.isPresent() && existing.get().isSignedIn()) {
            return Map.of("signedIn", true, "csrfToken", "");
        }

        PreloginSessionResult pre = authService.createPreloginSession(response);
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("signedIn", false);
        res.put("csrfToken", pre.csrfToken());
        return res;
    }

    @RequestMapping(path = {
            "/api/v1/auth/reset",
            "/api/auth/reset"
    })
    @Operation(summary = "서버단 쿠키 및 세션 강제 초기화")
    public ResponseEntity<Map<String, Object>> resetSession(
            HttpServletRequest request,
            HttpServletResponse response) {
        authService.logout(request, response);
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("success", true);
        res.put("ok", true);
        res.put("message", "세션 쿠키가 서버단에서 강제 초기화되었습니다.");
        return ResponseEntity.ok(res);
    }
}
