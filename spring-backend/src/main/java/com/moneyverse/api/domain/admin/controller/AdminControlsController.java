package com.moneyverse.api.domain.admin.controller;

import com.moneyverse.api.domain.admin.dto.AdminGovernanceDtos.FeatureSwitchOverviewResponse;
import com.moneyverse.api.domain.admin.dto.AdminGovernanceDtos.SetFeatureSwitchRequest;
import com.moneyverse.api.domain.admin.service.AdminAuthService;
import com.moneyverse.api.domain.admin.service.AdminGovernanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Tag(name = "Admin Controls", description = "관리자 피처 플래그 및 비상 킬스위치 제어 API")
@RestController
public class AdminControlsController {

    private final AdminGovernanceService governanceService;
    private final AdminAuthService adminAuthService;

    public AdminControlsController(AdminGovernanceService governanceService, AdminAuthService adminAuthService) {
        this.governanceService = governanceService;
        this.adminAuthService = adminAuthService;
    }

    @Operation(summary = "피처 플래그 및 킬스위치 현황 조회")
    @GetMapping(path = {
            "/api/v1/admin/controls",
            "/api/admin/controls"
    })
    public ResponseEntity<?> getControlsOverview(HttpServletRequest request) {
        if (!adminAuthService.isAuthorizedAdmin(request)) return adminAuthService.unauthorizedResponse();
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
        if (!adminAuthService.isAuthorizedAdmin(request)) return adminAuthService.unauthorizedResponse();
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
        if (!adminAuthService.isAuthorizedAdmin(request)) return adminAuthService.unauthorizedResponse();
        Map<String, Object> res = governanceService.setFeatureSwitch(null, featureKey, body);
        return ResponseEntity.ok(res);
    }
}
