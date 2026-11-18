package com.moneyverse.api.domain.admin.controller;

import com.moneyverse.api.domain.admin.dto.AdminGovernanceDtos.EconomyReconciliationHealthDto;
import com.moneyverse.api.domain.admin.service.AdminGovernanceService;
import com.moneyverse.api.domain.admin.service.AdminAuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@Tag(name = "Admin Economy & Reconciliation", description = "관리자 가상 경제 복식부기 및 건전성 스냅샷 API")
@RestController
public class AdminEconomyController {

    private static final Logger log = LoggerFactory.getLogger(AdminEconomyController.class);


    private final AdminGovernanceService governanceService;
    private final AdminAuthService adminAuthService;

    public AdminEconomyController(AdminGovernanceService governanceService, AdminAuthService adminAuthService) {
        this.governanceService = governanceService;
        this.adminAuthService = adminAuthService;
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

    @Operation(summary = "경제 복식부기 건전성 최신 스냅샷 조회")
    @GetMapping(path = {
            "/api/v1/admin/economy/reconciliations/latest",
            "/api/admin/economy/reconciliations/latest",
            "/api/v1/admin/economy/reconciliation/latest",
            "/api/admin/economy/reconciliation/latest"
    })
    public ResponseEntity<?> getReconciliationHealth(HttpServletRequest request) {
        if (adminAuthService.resolveVerifiedAdminActor(request).isEmpty()) return unauthorizedResponse();
        EconomyReconciliationHealthDto response = governanceService.getLatestReconciliationHealth(adminAuthService.resolveVerifiedAdminActor(request).orElseThrow());
        return ResponseEntity.ok(response);
    }
}
