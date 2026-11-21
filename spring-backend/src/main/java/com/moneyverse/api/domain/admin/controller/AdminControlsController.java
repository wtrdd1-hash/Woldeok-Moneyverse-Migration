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

@Tag(name="Admin Controls",description="Verified administrator feature-switch access")
@RestController
public class AdminControlsController {
    private final AdminGovernanceService governance;
    private final AdminAuthService auth;
    public AdminControlsController(AdminGovernanceService governance,AdminAuthService auth) {
        this.governance=governance;this.auth=auth;
    }
    @GetMapping({"/api/v1/admin/controls","/api/admin/controls"})
    @Operation(summary="Read feature switches for the verified administrator")
    public ResponseEntity<?> getControlsOverview(HttpServletRequest request) {
        var actor=auth.resolveVerifiedAdminActor(request);
        if(actor.isEmpty())return auth.unauthorizedResponse();
        FeatureSwitchOverviewResponse result=governance.getFeatureSwitchesOverview(actor.get());
        return ResponseEntity.ok(result);
    }
    private ResponseEntity<?> unavailableHighRiskMutation(HttpServletRequest request) {
        if(auth.resolveVerifiedAdminActor(request).isEmpty())return auth.unauthorizedResponse();
        if(!auth.hasVerifiedSessionCsrf(request))
            return ResponseEntity.status(403).body(Map.of("ok",false,"code","CSRF_REQUIRED"));
        // An internal token or browser OTP length is not a session-bound MFA receipt.
        return ResponseEntity.status(503).body(Map.of("ok",false,"code","ADMIN_STEP_UP_UNAVAILABLE"));
    }
    @PostMapping({"/api/v1/admin/controls","/api/admin/controls"})
    @Operation(summary="Legacy quick toggle is unavailable until verified native step-up exists")
    public ResponseEntity<?> toggleControl(HttpServletRequest request,@RequestBody Map<String,Object> body) {
        return unavailableHighRiskMutation(request);
    }
    @PutMapping({"/api/v1/admin/controls/feature-switches/economy_auto_policy","/api/admin/controls/feature-switches/economy_auto_policy"})
    @Operation(summary="Automatic policy changes require verified native step-up")
    public ResponseEntity<?> setAutoPolicySwitch(HttpServletRequest request,@Valid @RequestBody SetFeatureSwitchRequest body) {
        return unavailableHighRiskMutation(request);
    }
    @PutMapping({"/api/v1/admin/controls/feature-switches/{featureKey}","/api/admin/controls/feature-switches/{featureKey}"})
    @Operation(summary="High-risk switch changes require verified native step-up")
    public ResponseEntity<?> setFeatureSwitch(HttpServletRequest request,@PathVariable("featureKey") String featureKey,
            @Valid @RequestBody SetFeatureSwitchRequest body) {
        return unavailableHighRiskMutation(request);
    }
}
