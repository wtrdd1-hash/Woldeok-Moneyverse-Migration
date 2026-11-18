package com.moneyverse.api.domain.admin.controller;

import com.moneyverse.api.domain.admin.dto.AdminGovernanceDtos.AdminStocksResponse;
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

@Tag(name = "Admin Stocks", description = "관리자 상장 주식 및 시장 서킷브레이커 제어 API")
@RestController
public class AdminStocksController {

    private static final Logger log = LoggerFactory.getLogger(AdminStocksController.class);


    private final AdminGovernanceService governanceService;
    private final AdminAuthService adminAuthService;

    public AdminStocksController(AdminGovernanceService governanceService, AdminAuthService adminAuthService) {
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

    @Operation(summary = "관리자 상장 주식 목록 조회")
    @GetMapping(path = {
            "/api/v1/admin/stocks",
            "/api/admin/stocks"
    })
    public ResponseEntity<?> getStocks(HttpServletRequest request) {
        if (adminAuthService.resolveVerifiedAdminActor(request).isEmpty()) return unauthorizedResponse();
        AdminStocksResponse response = governanceService.listStocks(adminAuthService.resolveVerifiedAdminActor(request).orElseThrow());
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "가상 주식 시장 긴급 매매정지(Halt) 토글")
    @PostMapping(path = {
            "/api/v1/admin/stocks/{id}/halt",
            "/api/admin/stocks/{id}/halt"
    })
    public ResponseEntity<?> haltStock(
            HttpServletRequest request,
            @PathVariable("id") String stockId,
            @RequestBody(required = false) Map<String, Object> body
    ) {
        if (adminAuthService.resolveVerifiedAdminActor(request).isEmpty()) return unauthorizedResponse();
        // Do not claim a halt occurred without a canonical state transition receipt.
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of("code", "STOCK_HALT_NOT_VERIFIED"));
    }
}
