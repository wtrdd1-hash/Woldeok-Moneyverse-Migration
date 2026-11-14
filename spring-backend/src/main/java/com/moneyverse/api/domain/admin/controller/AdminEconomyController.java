package com.moneyverse.api.domain.admin.controller;

import com.moneyverse.api.domain.admin.dto.AdminGovernanceDtos.EconomyReconciliationHealthDto;
import com.moneyverse.api.domain.admin.service.AdminGovernanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
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

    @Value("${moneyverse.security.internal-token:8e5f2a1b9c3d4e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f}")
    private String internalToken;

    private final AdminGovernanceService governanceService;

    public AdminEconomyController(AdminGovernanceService governanceService) {
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

    @Operation(summary = "경제 복식부기 건전성 최신 스냅샷 조회")
    @GetMapping(path = {
            "/api/v1/admin/economy/reconciliations/latest",
            "/api/admin/economy/reconciliations/latest",
            "/api/v1/admin/economy/reconciliation/latest",
            "/api/admin/economy/reconciliation/latest"
    })
    public ResponseEntity<?> getReconciliationHealth(HttpServletRequest request) {
        if (!isAuthorized(request)) return unauthorizedResponse();
        EconomyReconciliationHealthDto response = governanceService.getLatestReconciliationHealth(null);
        return ResponseEntity.ok(response);
    }
}
