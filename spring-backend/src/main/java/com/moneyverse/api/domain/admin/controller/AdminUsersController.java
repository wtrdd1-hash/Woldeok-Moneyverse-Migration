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
    private static final com.fasterxml.jackson.databind.ObjectMapper MAPPER = new com.fasterxml.jackson.databind.ObjectMapper()
            .enable(com.fasterxml.jackson.databind.DeserializationFeature.USE_BIG_INTEGER_FOR_INTS)
            .enable(com.fasterxml.jackson.databind.DeserializationFeature.USE_BIG_DECIMAL_FOR_FLOATS);

    private static Object exactIntegers(com.fasterxml.jackson.databind.JsonNode node, String key) {
        if (node == null || node.isNull()) return null;
        if (node.isObject()) {
            Map<String, Object> out = new LinkedHashMap<>();
            node.fields().forEachRemaining(e -> out.put(e.getKey(), exactIntegers(e.getValue(), e.getKey())));
            return out;
        }
        if (node.isArray()) {
            List<Object> out = new ArrayList<>();
            node.forEach(item -> out.add(exactIntegers(item, key)));
            return out;
        }
        if (node.isIntegralNumber()) {
            return key != null && key.endsWith("Bps") ? node.numberValue() : node.bigIntegerValue().toString();
        }
        if (node.isNumber()) return node.decimalValue().toPlainString();
        if (node.isBoolean()) return node.booleanValue();
        return node.asText();
    }

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

        UUID actor = adminAuthService.resolveVerifiedAdminActor(request).orElseThrow();
        // virtual_stocks / virtual_stock_positions are revoked from the application role (023/047);
        // admin_get_user_portfolio checks the actor's role inside the function and returns the
        // identity fields the member detail page validates. Amounts in it are informational; the
        // page takes exact WLD strings from the directory.
        try {
            String json = jdbcTemplate.queryForObject(
                    "SELECT public.admin_get_user_portfolio(?::uuid, ?::uuid)::text", String.class, actor, uid);
            // Money in the jsonb arrives as JSON numbers; a JavaScript client rounds beyond 2^53.
            // Every integer leaves as an exact integer string; basis-point fields stay numbers.
            com.fasterxml.jackson.databind.JsonNode tree = MAPPER.readTree(json);
            @SuppressWarnings("unchecked")
            Map<String, Object> portfolio = (Map<String, Object>) exactIntegers(tree, null);
            Map<String, Object> body = new LinkedHashMap<>();
            body.put("ok", true);
            body.put("portfolio", portfolio);
            return ResponseEntity.ok(body);
        } catch (org.springframework.dao.DataAccessException e) {
            String state = e.getMostSpecificCause() instanceof java.sql.SQLException sql ? sql.getSQLState() : null;
            if ("22023".equals(state)) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "USER_NOT_FOUND"));
            if ("28000".equals(state)) return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "ADMIN_AUTHORITY_REQUIRED"));
            log.error("[AdminUsersController] getUserPortfolio unavailable: {}", e.getClass().getSimpleName());
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of("error", "PORTFOLIO_UNAVAILABLE"));
        } catch (Exception e) {
            log.error("[AdminUsersController] getUserPortfolio unreadable: {}", e.getClass().getSimpleName());
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of("error", "PORTFOLIO_UNAVAILABLE"));
        }
    }
}
