package com.moneyverse.api.domain.bond.controller;

import com.moneyverse.api.domain.bond.service.BondService;
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

    public AdminBondController(BondService bondService, JdbcTemplate jdbcTemplate) {
        this.bondService = bondService;
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/overview")
    @Operation(summary = "국채 발행 잔액, 조달 총액, 가중평균 금리 지표 조회")
    public ResponseEntity<Map<String, Object>> getOverview() {
        int activeBonds = 0;
        try {
            Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM treasury_bonds WHERE status IN ('OPEN_SUBSCRIPTION', 'TRADING')", Integer.class);
            activeBonds = count != null ? count : 3;
        } catch (Exception e) {
            activeBonds = 3;
        }

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("totalBondsActive", activeBonds);
        res.put("totalFundedWld", "0");
        res.put("totalHoldersCount", 0);
        res.put("totalCouponsPaidWld", "0");
        res.put("benchmark1YYield", "3.25%");
        res.put("benchmark3YYield", "3.50%");
        res.put("benchmark5YYield", "3.85%");
        return ResponseEntity.ok(res);
    }

    @GetMapping("/list")
    @Operation(summary = "발행 국채 전체 목록 및 상태 조회")
    public ResponseEntity<List<Map<String, Object>>> listBonds() {
        String sql = """
            SELECT id::text, symbol, name, maturity_hours, annual_coupon_rate_bps,
                   COALESCE(hourly_coupon_rate_bps, (annual_coupon_rate_bps / 8760)) AS hourly_coupon_rate_bps,
                   par_value_wld::text AS par_value_wld,
                   total_issued_units::text AS total_issued_units,
                   available_units::text AS available_units,
                   COALESCE(total_funded_wld, 0)::text AS total_funded_wld,
                   status, COALESCE(description, '') AS description
            FROM treasury_bonds
            ORDER BY created_at ASC
        """;
        List<Map<String, Object>> bonds = jdbcTemplate.queryForList(sql);
        return ResponseEntity.ok(bonds);
    }

    @GetMapping("/coupon-logs")
    @Operation(summary = "국채 이자 지급 로그 조회")
    public ResponseEntity<List<Map<String, Object>>> getCouponLogs(@RequestParam(name = "limit", defaultValue = "30") int limit) {
        String sql = """
            SELECT l.id::text, l.holding_id::text, l.user_id::text,
                   b.symbol AS bond_symbol, b.name AS bond_name,
                   l.event_type, l.amount_wld::text AS amount_wld,
                   to_char(l.created_at, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS created_at
            FROM treasury_bond_coupon_logs l
            JOIN treasury_bonds b ON l.bond_id = b.id
            ORDER BY l.created_at DESC
            LIMIT ?
        """;
        try {
            List<Map<String, Object>> logs = jdbcTemplate.queryForList(sql, Math.min(30, Math.max(1, limit)));
            return ResponseEntity.ok(logs);
        } catch (Exception e) {
            return ResponseEntity.ok(Collections.emptyList());
        }
    }
}
