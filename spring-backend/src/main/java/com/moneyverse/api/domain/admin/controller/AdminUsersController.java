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
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@Tag(name = "Admin Users", description = "관리자 회원 디렉토리 및 권한/제한 관리 API")
@RestController
public class AdminUsersController {

    private static final Logger log = LoggerFactory.getLogger(AdminUsersController.class);

    private final AdminGovernanceService governanceService;
    private final AdminAuthService adminAuthService;
    private final JdbcTemplate jdbcTemplate;

    public AdminUsersController(AdminGovernanceService governanceService, AdminAuthService adminAuthService, JdbcTemplate jdbcTemplate) {
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

        UUID uid;
        try {
            uid = UUID.fromString(userId);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "INVALID_USER_ID"));
        }

        try {
            // 1. 현금 잔액 조회
            Long cashBalance = 0L;
            try {
                cashBalance = jdbcTemplate.queryForObject(
                    "SELECT COALESCE(ab.balance, 0) FROM accounts a JOIN account_balances ab ON a.id = ab.account_id WHERE a.owner_user_id = ? AND a.account_type = 'USER_CASH' LIMIT 1",
                    Long.class, uid
                );
                if (cashBalance == null) cashBalance = 0L;
            } catch (Exception ignored) {}

            // 2. 보유 주식 목록 조회
            String stockSql = """
                SELECT p.stock_id, s.symbol, s.name, p.quantity, p.average_cost, s.current_price
                FROM virtual_stock_positions p
                JOIN virtual_stocks s ON p.stock_id = s.id
                WHERE p.user_id = ? AND p.quantity > 0
                """;

            List<Map<String, Object>> holdings = jdbcTemplate.query(stockSql, (rs, rowNum) -> {
                Map<String, Object> h = new LinkedHashMap<>();
                h.put("stockId", rs.getString("stock_id"));
                h.put("symbol", rs.getString("symbol"));
                h.put("name", rs.getString("name"));
                long qty = rs.getLong("quantity");
                long avgCost = rs.getLong("average_cost");
                long curPrice = rs.getLong("current_price");
                h.put("quantity", qty);
                h.put("averageCost", avgCost);
                h.put("currentPrice", curPrice);
                long evalValue = qty * curPrice;
                h.put("evalValue", evalValue);
                double pnlPct = avgCost > 0 ? (((double)(curPrice - avgCost) / avgCost) * 100.0) : 0.0;
                h.put("pnlPercentage", Math.round(pnlPct * 100.0) / 100.0);
                return h;
            }, uid);

            long totalStockEval = holdings.stream().mapToLong(h -> (Long) h.get("evalValue")).sum();

            Map<String, Object> portfolio = new LinkedHashMap<>();
            portfolio.put("userId", userId);
            portfolio.put("cashBalance", String.valueOf(cashBalance));
            portfolio.put("stockEvaluation", String.valueOf(totalStockEval));
            portfolio.put("totalNetWorth", String.valueOf(cashBalance + totalStockEval));
            portfolio.put("holdings", holdings);

            return ResponseEntity.ok(Map.of("ok", true, "portfolio", portfolio));
        } catch (Exception e) {
            log.error("[AdminUsersController] getUserPortfolio error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "FAILED_TO_LOAD_PORTFOLIO"));
        }
    }
}
