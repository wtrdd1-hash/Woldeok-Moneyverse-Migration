package com.moneyverse.api.domain.health.controller;

import com.moneyverse.api.common.response.ApiResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;
import java.util.LinkedHashMap;
import java.util.regex.Pattern;

@RestController
public class HealthController {
    private static final Pattern FULL_SHA = Pattern.compile("[0-9a-f]{40}");

    @Value("${moneyverse.release.sha:}")
    private String releaseSha;

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
    public Map<String, Object> version() {
        Map<String, Object> response = new LinkedHashMap<>();
        // Only a verified deployment-injected artifact SHA may be exposed.
        response.put("id", releaseSha != null && FULL_SHA.matcher(releaseSha).matches() ? releaseSha : null);
        response.put("success", true);
        response.put("data", Map.of(
                "version", "v2026.11.14-spring",
                "framework", "Spring Boot 3.3.5",
                "release", "enterprise-spring-transition",
                "activeEngine", "Java Spring Boot"
        ));
        return response;
    }
}
