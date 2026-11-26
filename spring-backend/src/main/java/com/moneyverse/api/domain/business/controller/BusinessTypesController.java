package com.moneyverse.api.domain.business.controller;

import com.moneyverse.api.domain.identity.service.MemberApiGuard;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.NestedExceptionUtils;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.sql.SQLException;
import java.util.*;

/**
 * Business-type catalogue and purchases (NestJS BusinessController contract). The path used to
 * be swallowed by BusinessController's "my businesses" handler, so /businesses crashed for every
 * member (signed-in E2E 2026-11-25). Purchases go only through the journaled business_purchase.
 */
@RestController
public class BusinessTypesController {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(BusinessTypesController.class);
    private final JdbcClient jdbc;
    private final MemberApiGuard guard;

    public BusinessTypesController(JdbcClient jdbc, MemberApiGuard guard) {
        this.jdbc = jdbc;
        this.guard = guard;
    }

    @GetMapping({"/api/v1/business-types", "/api/business-types"})
    @Operation(summary = "Business types the member does not own yet")
    public ResponseEntity<?> catalogue(HttpServletRequest request) {
        UUID actor = guard.actor(request);
        try {
            List<Map<String, Object>> all = jdbc.sql("SELECT id::text AS id, symbol, name, description, purchase_cost::text AS purchase_cost, "
                    + "daily_revenue::text AS daily_revenue, daily_operating_cost::text AS daily_operating_cost FROM public.business_catalog()")
                    .query().listOfRows();
            Set<String> owned = new HashSet<>(jdbc.sql("SELECT business_type_id::text FROM public.business_my_ownerships_v2(?::uuid)")
                    .param(actor).query(String.class).list());
            return ResponseEntity.ok().cacheControl(CacheControl.noStore().cachePrivate()).body(Map.of("businessTypes", available(all, owned)));
        } catch (RuntimeException e) {
            throw translate(e);
        }
    }

    @PostMapping({"/api/v1/business-types/{id}/purchases", "/api/business-types/{id}/purchases"})
    @Operation(summary = "Buy a business type (journaled; session, CSRF, idempotency key)")
    public ResponseEntity<?> purchase(HttpServletRequest request, @PathVariable("id") String id, @RequestBody(required = false) Map<String, Object> body) {
        UUID actor = guard.verifiedMutationActor(request);
        UUID type;
        try { type = UUID.fromString(id); } catch (IllegalArgumentException e) { return ResponseEntity.status(404).body(Map.of("code", "BUSINESS_TYPE_NOT_FOUND")); }
        UUID key = guard.idempotencyKey(body != null && body.get("idempotencyKey") instanceof String s ? s : null);
        try {
            Map<String, Object> r = jdbc.sql("SELECT ownership_id::text AS ownership_id, business_type_id::text AS business_type_id, purchase_cost::text AS purchase_cost, "
                            + "transaction_id::text AS transaction_id, replayed FROM public.business_purchase(?::uuid, ?::uuid, ?::uuid)")
                    .param(key).param(actor).param(type).query().listOfRows().stream().findFirst()
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "BUSINESS_RECEIPT_MISSING"));
            return ResponseEntity.ok().cacheControl(CacheControl.noStore().cachePrivate()).body(r);
        } catch (RuntimeException e) {
            throw translate(e);
        }
    }

    public static List<Map<String, Object>> available(List<Map<String, Object>> all, Set<String> owned) {
        List<Map<String, Object>> out = new ArrayList<>();
        for (Map<String, Object> r : all) {
            if (owned.contains(String.valueOf(r.get("id")))) continue;
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", r.get("id"));
            m.put("symbol", r.get("symbol"));
            m.put("name", r.get("name"));
            m.put("description", r.get("description"));
            m.put("purchaseCost", r.get("purchase_cost"));
            m.put("dailyRevenue", r.get("daily_revenue"));
            m.put("dailyOperatingCost", r.get("daily_operating_cost"));
            out.add(m);
        }
        return out;
    }

    private static ResponseStatusException translate(RuntimeException e) {
        if (e instanceof ResponseStatusException rse) return rse;
        Throwable c = NestedExceptionUtils.getMostSpecificCause(e);
        String state = c instanceof SQLException sql ? sql.getSQLState() : null;
        log.warn("[business-types] db call failed: {} sqlstate={} {}", c.getClass().getSimpleName(), state, String.valueOf(c.getMessage()).replaceAll("\\s+", " "));
        if (state != null && Set.of("22023", "23505", "55000", "P0001").contains(state)) return new ResponseStatusException(HttpStatus.CONFLICT, "BUSINESS_REQUEST_REFUSED");
        if ("28000".equals(state)) return new ResponseStatusException(HttpStatus.FORBIDDEN, "BUSINESS_RECEIPT_NOT_YOURS");
        return new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "BUSINESS_SOURCE_UNAVAILABLE");
    }
}
