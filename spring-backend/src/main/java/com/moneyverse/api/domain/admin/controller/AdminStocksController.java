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

        UUID sid;
        try {
            sid = UUID.fromString(stockId);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "INVALID_STOCK_ID"));
        }

        try {
            String currentStatus = jdbcTemplate.queryForObject(
                "SELECT COALESCE(halt_status, 'ACTIVE') FROM virtual_stocks WHERE id = ?",
                String.class, sid
            );

            boolean shouldHalt = !"HALTED".equalsIgnoreCase(currentStatus);
            String nextStatus = shouldHalt ? "HALTED" : "ACTIVE";

            jdbcTemplate.update(
                "UPDATE virtual_stocks SET halt_status = ?, halted_at = CASE WHEN ? = 'HALTED' THEN NOW() ELSE NULL END, updated_at = NOW() WHERE id = ?",
                nextStatus, nextStatus, sid
            );

            Map<String, Object> res = new LinkedHashMap<>();
            res.put("ok", true);
            res.put("stockId", stockId);
            res.put("haltStatus", nextStatus);
            res.put("active", !shouldHalt);
            return ResponseEntity.ok(res);
        } catch (Exception e) {
            log.error("[AdminStocksController] haltStock error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "FAILED_TO_UPDATE_STOCK_HALT"));
        }
    }
}
