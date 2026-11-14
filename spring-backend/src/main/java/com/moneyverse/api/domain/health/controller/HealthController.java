package com.moneyverse.api.domain.health.controller;

import com.moneyverse.api.common.response.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
public class HealthController {

    @GetMapping("/health")
    public ApiResponse<Map<String, Object>> health() {
        return ApiResponse.ok(Map.of(
                "status", "UP",
                "service", "moneyverse-spring-backend",
                "runtime", System.getProperty("java.version"),
                "timestamp", Instant.now().toString()
        ));
    }

    @GetMapping("/api/version")
    public ApiResponse<Map<String, Object>> version() {
        return ApiResponse.ok(Map.of(
                "version", "v2026.11.14-spring",
                "framework", "Spring Boot 3.3.5",
                "release", "enterprise-spring-transition",
                "activeEngine", "Java Spring Boot"
        ));
    }
}
