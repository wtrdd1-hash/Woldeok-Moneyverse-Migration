package com.moneyverse.api.domain.auth.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

@RestController
@RequestMapping(path = {
        "/api/v1/auth/bootstrap",
        "/api/auth/bootstrap",
        "/auth/bootstrap"
})
public class BootstrapController {

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getBootstrapStatus() {
        // 이미 프로덕션에는 슈퍼어드민이 구성되어 있으므로 canBootstrap = false 반환 (보안 Fail-Safe)
        return ResponseEntity.ok(Map.of(
                "canBootstrap", false,
                "initialized", true,
                "message", "시스템이 이미 초기화되어 슈퍼어드민 부트스트랩이 영구 비활성화되었습니다."
        ));
    }

    @PostMapping("/superadmin")
    public ResponseEntity<Map<String, Object>> bootstrapSuperAdmin(@RequestBody(required = false) Map<String, Object> body) {
        // 보안 가드: 이미 초기화된 시스템에서는 영구 거부
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "BOOTSTRAP_ALREADY_INITIALIZED");
    }
}
