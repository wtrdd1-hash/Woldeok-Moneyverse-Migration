package com.moneyverse.api.domain.bond.controller;

import com.moneyverse.api.domain.admin.service.AdminAuthService;
import com.moneyverse.api.domain.bond.service.BondService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@Tag(name = "Admin Treasury Bonds", description = "관리자 가상 국채 종목 발행 및 부채 지표 관리 API")
@RestController
@RequestMapping(path = {"/api/admin/bonds", "/api/v1/admin/bonds"})
public class AdminBondController {

    private final BondService bondService;
    private final JdbcTemplate jdbcTemplate;
    private final AdminAuthService adminAuthService;

    public AdminBondController(BondService bondService, JdbcTemplate jdbcTemplate, AdminAuthService adminAuthService) {
        this.bondService = bondService;
        this.jdbcTemplate = jdbcTemplate;
        this.adminAuthService = adminAuthService;
    }

    /*
     * treasury_bonds and treasury_bond_coupon_logs are not granted to the application role, so the
     * direct reads here always failed and the overview answered a fallback of 3 active bonds with
     * fixed benchmark yields. Migration 363 reads them with the administrator checked inside the
     * function. No benchmark yield has a certified source, so it is withheld as "—".
     */
    private UUID actor(HttpServletRequest request) {
        return adminAuthService.resolveVerifiedAdminActor(request)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "admin_session_required"));
    }

    private List<Map<String, Object>> rows(String sql, Object... params) {
        try {
            return jdbcTemplate.queryForList(sql, params);
        } catch (DataAccessException e) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "BOND_SOURCE_UNAVAILABLE");
        }
    }

    @GetMapping("/overview")
    @Operation(summary = "국채 발행 잔액, 조달 총액, 보유자 수, 지급 이자 합계 조회")
    public ResponseEntity<Map<String, Object>> getOverview(HttpServletRequest request) {
        UUID actor = actor(request);
        List<Map<String, Object>> found = rows("SELECT * FROM public.admin_treasury_bonds_overview_read(?::uuid)", actor);
        if (found.isEmpty()) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "BOND_SOURCE_UNAVAILABLE");
        Map<String, Object> row = found.get(0);
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("totalBondsActive", ((Number) row.get("total_bonds_active")).longValue());
        res.put("totalFundedWld", String.valueOf(row.get("total_funded_wld")));
        res.put("totalHoldersCount", ((Number) row.get("total_holders_count")).longValue());
        res.put("totalCouponsPaidWld", String.valueOf(row.get("total_coupons_paid_wld")));
        res.put("benchmark1YYield", "—");
        res.put("benchmark3YYield", "—");
        res.put("benchmark5YYield", "—");
        return ResponseEntity.ok(res);
    }

    @GetMapping("/list")
    @Operation(summary = "발행 국채 전체 목록 및 상태 조회")
    public ResponseEntity<List<Map<String, Object>>> listBonds(HttpServletRequest request) {
        UUID actor = actor(request);
        return ResponseEntity.ok(rows("SELECT * FROM public.admin_treasury_bonds_read(?::uuid)", actor));
    }

    @GetMapping("/coupon-logs")
    @Operation(summary = "국채 이자 지급 로그 조회")
    public ResponseEntity<List<Map<String, Object>>> getCouponLogs(HttpServletRequest request,
            @RequestParam(name = "limit", defaultValue = "30") int limit) {
        UUID actor = actor(request);
        return ResponseEntity.ok(rows("SELECT * FROM public.admin_treasury_bond_coupon_logs_read(?::uuid, ?::integer)",
                actor, Math.min(30, Math.max(1, limit))));
    }
}
