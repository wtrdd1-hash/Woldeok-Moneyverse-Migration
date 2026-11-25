package com.moneyverse.api.domain.shop.controller;

import com.moneyverse.api.domain.identity.service.MemberApiGuard;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.NestedExceptionUtils;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

/**
 * The member's held catalogue items (QA 2026-11-25: /api/v1/shop/holdings was 404), from
 * shop_my_items_v2 with the NestJS 'attention' filter. The page sends ?status=attention while
 * NestJS read ?filter=attention; both are accepted.
 */
@RestController
public class ShopHoldingsController {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(ShopHoldingsController.class);
    private static final String ISO = "'YYYY-MM-DD\"T\"HH24:MI:SS.MS\"Z\"'";
    private static final String COLUMNS = "h.catalog_id::text AS catalog_id, h.code, h.name, h.description, h.category, h.quantity, "
            + "to_char(h.acquired_at AT TIME ZONE 'UTC', " + ISO + ") AS acquired_at, "
            + "CASE WHEN h.expires_at IS NULL THEN NULL ELSE to_char(h.expires_at AT TIME ZONE 'UTC', " + ISO + ") END AS expires_at, "
            + "h.effect_kind::text AS effect_kind, h.rarity, h.animation_css, h.preview_data::text AS preview_data, h.is_equipped, h.equipped_slot, "
            + "h.serial_number, h.durable, h.weekly_cost::text AS weekly_cost, "
            + "CASE WHEN h.effect_expires_at IS NULL THEN NULL ELSE to_char(h.effect_expires_at AT TIME ZONE 'UTC', " + ISO + ") END AS effect_expires_at, "
            + "h.unpaid_weeks, h.arrears_due::text AS arrears_due, h.arrears_cap::text AS arrears_cap, h.suspended";
    private final JdbcClient jdbc;
    private final MemberApiGuard guard;

    public ShopHoldingsController(JdbcClient jdbc, MemberApiGuard guard) {
        this.jdbc = jdbc;
        this.guard = guard;
    }

    @GetMapping({"/api/v1/shop/holdings", "/api/shop/holdings"})
    @Operation(summary = "The member's held catalogue items (optionally only those needing attention)")
    public ResponseEntity<?> holdings(HttpServletRequest request,
            @RequestParam(value = "filter", required = false) String filter,
            @RequestParam(value = "status", required = false) String status) {
        UUID actor = guard.actor(request);
        String f = filter != null ? filter : status;
        if (f != null && !"attention".equals(f)) return ResponseEntity.badRequest().body(Map.of("code", "HOLDINGS_FILTER_INVALID"));
        List<Map<String, Object>> rows;
        try {
            rows = new ArrayList<>();
            for (Map<String, Object> r : jdbc.sql("SELECT " + COLUMNS + " FROM public.shop_my_items_v2(?::uuid) AS h").param(actor).query().listOfRows()) {
                Map<String, Object> m = new LinkedHashMap<>(r);
                m.put("preview_data", parseJson(r.get("preview_data")));
                rows.add(m);
            }
        } catch (RuntimeException e) {
            Throwable c = NestedExceptionUtils.getMostSpecificCause(e);
            log.warn("[shop-holdings] db call failed: {} {}", c.getClass().getSimpleName(), String.valueOf(c.getMessage()).replaceAll("\\s+", " "));
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "SHOP_HOLDINGS_UNAVAILABLE");
        }
        if ("attention".equals(f)) rows = attention(rows);
        return ResponseEntity.ok().cacheControl(CacheControl.noStore().cachePrivate()).body(Map.of("holdings", rows));
    }

    public static List<Map<String, Object>> attention(List<Map<String, Object>> rows) {
        List<Map<String, Object>> out = new ArrayList<>();
        for (Map<String, Object> r : rows) {
            boolean suspended = Boolean.TRUE.equals(r.get("suspended"));
            int unpaid = r.get("unpaid_weeks") instanceof Number n ? n.intValue() : 0;
            if (suspended || unpaid > 0) out.add(r);
        }
        return out;
    }

    @SuppressWarnings("unchecked")
    private static Object parseJson(Object raw) {
        if (raw == null) return null;
        try { return new com.fasterxml.jackson.databind.ObjectMapper().readValue(raw.toString(), Object.class); }
        catch (Exception e) { return null; }
    }
}
