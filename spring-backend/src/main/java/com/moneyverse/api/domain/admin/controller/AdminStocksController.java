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
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@Tag(name = "Admin Stocks", description = "관리자 상장 주식 및 시장 서킷브레이커 제어 API")
@RestController
public class AdminStocksController {

    private static final Logger log = LoggerFactory.getLogger(AdminStocksController.class);

    private final AdminGovernanceService governanceService;
    private final AdminAuthService adminAuthService;
    private final JdbcTemplate jdbcTemplate;

    public AdminStocksController(AdminGovernanceService governanceService, AdminAuthService adminAuthService, JdbcTemplate jdbcTemplate) {
        this.governanceService = governanceService;
        this.adminAuthService = adminAuthService;
        this.jdbcTemplate = jdbcTemplate;
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

        try {
            UUID.fromString(stockId);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "INVALID_STOCK_ID"));
        }

        // Migration 287 suspends halt settlement (P0 #1553) until a ledger-atomic settlement with a
        // replay receipt exists. This toggle used to UPDATE virtual_stocks directly, which skipped
        // that hold (holders were neither settled nor refunded) and needs table privileges the
        // application role does not hold. Rejected alternative: calling stock_halt_and_settle, which
        // raises 55000 by design today. Answer the truth instead.
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("ok", false);
        res.put("code", "stock_halt_suspended");
        res.put("detail", "stock halt is suspended until settlement is ledger-atomic");
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(res);
    }
}
