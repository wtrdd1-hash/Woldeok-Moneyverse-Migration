package com.moneyverse.api.domain.admin.controller;

import com.moneyverse.api.domain.admin.dto.AdminGovernanceDtos.AdminUsersResponse;
import com.moneyverse.api.domain.admin.service.AdminGovernanceService;
import com.moneyverse.api.domain.admin.service.AdminAuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@Tag(name = "Admin Users", description = "관리자 회원 디렉토리 및 권한/제한 관리 API")
@RestController
public class AdminUsersController {

    private static final Logger log = LoggerFactory.getLogger(AdminUsersController.class);


    private final AdminGovernanceService governanceService;
    private final AdminAuthService adminAuthService;

    public AdminUsersController(AdminGovernanceService governanceService, AdminAuthService adminAuthService) {
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

    @Operation(summary = "관리자 회원 목록 조회 (상위 자산가 순)")
    @GetMapping(path = {
            "/api/v1/admin/users",
            "/api/admin/users"
    })
    public ResponseEntity<?> getUsers(
            HttpServletRequest request,
            @RequestParam(name = "limit", defaultValue = "50") int limit
    ) {
        if (adminAuthService.resolveVerifiedAdminActor(request).isEmpty()) return unauthorizedResponse();
        AdminUsersResponse response = governanceService.listUsers(adminAuthService.resolveVerifiedAdminActor(request).orElseThrow(), limit);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "회원 자산 포트폴리오 상세 조회")
    @GetMapping(path = {
            "/api/v1/admin/users/{id}/portfolio",
            "/api/admin/users/{id}/portfolio"
    })
    public ResponseEntity<?> getUserPortfolio(
            HttpServletRequest request,
            @PathVariable("id") String userId
    ) {
        if (adminAuthService.resolveVerifiedAdminActor(request).isEmpty()) return unauthorizedResponse();
        // No canonical owner-scoped portfolio read path is certified for this migration.
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of("code", "PORTFOLIO_SOURCE_NOT_VERIFIED"));
    }
}
