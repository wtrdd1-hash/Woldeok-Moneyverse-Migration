package com.moneyverse.api.domain.admin.controller;

import com.moneyverse.api.domain.admin.dto.AdminGovernanceDtos.FeatureSwitchOverviewResponse;
import com.moneyverse.api.domain.admin.dto.AdminGovernanceDtos.SetFeatureSwitchRequest;
import com.moneyverse.api.domain.admin.service.AdminGovernanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@Tag(name = "Admin Controls", description = "관리자 피처 플래그 및 비상 킬스위치 제어 API")
@RestController
public class AdminControlsController {

    private static final Logger log = LoggerFactory.getLogger(AdminControlsController.class);

    @Value("${moneyverse.security.internal-token:8e5f2a1b9c3d4e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f}")
    private String internalToken;

    private final AdminGovernanceService governanceService;

    public AdminControlsController(AdminGovernanceService governanceService) {
        this.governanceService = governanceService;
    }

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

    @Operation(summary = "피처 플래그 및 킬스위치 현황 조회")
    @GetMapping(path = {
            "/api/v1/admin/controls",
            "/api/admin/controls"
    })
    public ResponseEntity<?> getControlsOverview(HttpServletRequest request) {
        if (!isAuthorized(request)) return unauthorizedResponse();
        FeatureSwitchOverviewResponse response = governanceService.getFeatureSwitchesOverview(null);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "경제 자동 정책 스위치 조정")
    @PutMapping(path = {
            "/api/v1/admin/controls/feature-switches/economy_auto_policy",
            "/api/admin/controls/feature-switches/economy_auto_policy"
    })
    public ResponseEntity<?> setAutoPolicySwitch(
            HttpServletRequest request,
            @Valid @RequestBody SetFeatureSwitchRequest body
    ) {
        if (!isAuthorized(request)) return unauthorizedResponse();
        Map<String, Object> res = governanceService.setFeatureSwitch(null, "economy_auto_policy", body);
        return ResponseEntity.ok(res);
    }

    @Operation(summary = "피처 스위치 상태 변경 (토글/킬스위치)")
    @PutMapping(path = {
            "/api/v1/admin/controls/feature-switches/{featureKey}",
            "/api/admin/controls/feature-switches/{featureKey}"
    })
    public ResponseEntity<?> setFeatureSwitch(
            HttpServletRequest request,
            @PathVariable("featureKey") String featureKey,
            @Valid @RequestBody SetFeatureSwitchRequest body
    ) {
        if (!isAuthorized(request)) return unauthorizedResponse();
        Map<String, Object> res = governanceService.setFeatureSwitch(null, featureKey, body);
        return ResponseEntity.ok(res);
    }
}
