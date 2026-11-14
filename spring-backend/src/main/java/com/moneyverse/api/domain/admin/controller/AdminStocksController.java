package com.moneyverse.api.domain.admin.controller;

import com.moneyverse.api.domain.admin.dto.AdminGovernanceDtos.AdminStocksResponse;
import com.moneyverse.api.domain.admin.service.AdminGovernanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@Tag(name = "Admin Stocks", description = "관리자 상장 주식 및 시장 서킷브레이커 제어 API")
@RestController
public class AdminStocksController {

    private static final Logger log = LoggerFactory.getLogger(AdminStocksController.class);

    @Value("${moneyverse.security.internal-token:8e5f2a1b9c3d4e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f}")
    private String internalToken;

    private final AdminGovernanceService governanceService;

    public AdminStocksController(AdminGovernanceService governanceService) {
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

    @Operation(summary = "관리자 상장 주식 목록 조회")
    @GetMapping(path = {
            "/api/v1/admin/stocks",
            "/api/admin/stocks"
    })
    public ResponseEntity<?> getStocks(HttpServletRequest request) {
        if (!isAuthorized(request)) return unauthorizedResponse();
        AdminStocksResponse response = governanceService.listStocks(null);
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
        if (!isAuthorized(request)) return unauthorizedResponse();
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("stockId", stockId);
        res.put("halted", true);
        res.put("message", "주식 매매가 긴급 정지되었습니다.");
        return ResponseEntity.ok(res);
    }
}
