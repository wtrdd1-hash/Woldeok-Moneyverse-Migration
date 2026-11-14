package com.moneyverse.api.domain.identity.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@Tag(name = "Auth Session & Policy", description = "인증 세션 CSRF 및 법적 정책 버전 API")
@RestController
public class AuthController {

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
}
