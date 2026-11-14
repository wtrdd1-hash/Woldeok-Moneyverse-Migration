package com.moneyverse.api.domain.admin.controller;

import com.moneyverse.api.domain.admin.dto.AdminGovernanceDtos.AdminUsersResponse;
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
import java.util.UUID;

@Tag(name = "Admin Users", description = "관리자 회원 디렉토리 및 권한/제한 관리 API")
@RestController
public class AdminUsersController {

    private static final Logger log = LoggerFactory.getLogger(AdminUsersController.class);

    @Value("${moneyverse.security.internal-token:8e5f2a1b9c3d4e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f}")
    private String internalToken;

    private final AdminGovernanceService governanceService;

    public AdminUsersController(AdminGovernanceService governanceService) {
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

    @Operation(summary = "관리자 회원 목록 조회 (상위 자산가 순)")
    @GetMapping(path = {
            "/api/v1/admin/users",
            "/api/admin/users"
    })
    public ResponseEntity<?> getUsers(
            HttpServletRequest request,
            @RequestParam(name = "limit", defaultValue = "51") int limit
    ) {
        if (!isAuthorized(request)) return unauthorizedResponse();
        AdminUsersResponse response = governanceService.listUsers(null, limit);
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
        if (!isAuthorized(request)) return unauthorizedResponse();
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("userId", userId);
        res.put("portfolio", Map.of(
                "cash", "0",
                "bank", "0",
                "bonds", "0",
                "stocks", "0"
        ));
        return ResponseEntity.ok(res);
    }
}
