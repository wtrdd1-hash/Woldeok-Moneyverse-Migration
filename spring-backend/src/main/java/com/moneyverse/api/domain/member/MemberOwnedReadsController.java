package com.moneyverse.api.domain.member;

import com.moneyverse.api.domain.identity.service.MemberApiGuard;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.NestedExceptionUtils;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

/**
 * Owner-scoped reads the /businesses and /wallet pages call (QA 2026-11-25: 404 in Spring),
 * through business_equity_standing, business_my_ownerships_v2 and wallet_reward_availability.
 * A DB failure is 503, never an empty answer.
 */
@Tag(name = "Member owned reads", description = "Business equity and ownerships, reward availability")
@RestController
public class MemberOwnedReadsController {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(MemberOwnedReadsController.class);
    private static final String ISO = "'YYYY-MM-DD\"T\"HH24:MI:SS.MS\"Z\"'";
    private final JdbcClient jdbc;
    private final MemberApiGuard guard;

    public MemberOwnedReadsController(JdbcClient jdbc, MemberApiGuard guard) {
        this.jdbc = jdbc;
        this.guard = guard;
    }

    @GetMapping({"/api/v1/business-equity", "/api/business-equity"})
    @Operation(summary = "Business equity standing (holdings, debt, equity, minimum ratio)")
    public ResponseEntity<?> equity(HttpServletRequest request) {
        UUID actor = guard.actor(request);
        Map<String, Object> row = run(() -> jdbc.sql("SELECT holdings_amount::text AS holdings_amount, debt_amount::text AS debt_amount, "
                        + "equity_amount::text AS equity_amount, minimum_ratio_bps FROM public.business_equity_standing(?::uuid)")
                .param(actor).query().listOfRows().stream().findFirst().orElseThrow(() -> new IllegalStateException("no equity row")));
        return privateOk(Map.of("equity", equityShape(row)));
    }

    @GetMapping({"/api/v1/businesses/my-v2", "/api/businesses/my-v2"})
    @Operation(summary = "The member's business ownerships")
    public ResponseEntity<?> ownerships(HttpServletRequest request) {
        UUID actor = guard.actor(request);
        List<Map<String, Object>> rows = run(() -> jdbc.sql("SELECT ownership_id::text AS ownership_id, business_type_id::text AS business_type_id, symbol, name, description, "
                        + "purchase_cost::text AS purchase_cost, daily_revenue::text AS daily_revenue, daily_operating_cost::text AS daily_operating_cost, "
                        + "to_char(purchased_at AT TIME ZONE 'UTC', " + ISO + ") AS purchased_at, last_settlement_date::text AS last_settlement_date, "
                        + "is_settled_today, boost_active::text AS boost_active, status FROM public.business_my_ownerships_v2(?::uuid)")
                .param(actor).query().listOfRows());
        List<Map<String, Object>> out = new ArrayList<>();
        for (Map<String, Object> r : rows) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("ownershipId", r.get("ownership_id"));
            m.put("businessTypeId", r.get("business_type_id"));
            m.put("symbol", r.get("symbol"));
            m.put("name", r.get("name"));
            m.put("description", r.get("description"));
            m.put("purchaseCost", r.get("purchase_cost"));
            m.put("dailyRevenue", r.get("daily_revenue"));
            m.put("dailyOperatingCost", r.get("daily_operating_cost"));
            m.put("purchasedAt", r.get("purchased_at"));
            m.put("lastSettlementDate", r.get("last_settlement_date"));
            m.put("isSettledToday", Boolean.TRUE.equals(r.get("is_settled_today")));
            m.put("boostActive", parseJson(r.get("boost_active")));
            m.put("status", r.get("status"));
            out.add(m);
        }
        return privateOk(Map.of("businesses", out));
    }

    @GetMapping({"/api/v1/rewards/availability", "/api/rewards/availability"})
    @Operation(summary = "Whether the daily and work rewards can be claimed now")
    public ResponseEntity<?> rewardAvailability(HttpServletRequest request) {
        UUID actor = guard.actor(request);
        Map<String, Object> r = run(() -> jdbc.sql("SELECT daily_available, "
                        + "CASE WHEN daily_next_eligible_at IS NULL THEN NULL ELSE to_char(daily_next_eligible_at AT TIME ZONE 'UTC', " + ISO + ") END AS daily_next, "
                        + "work_available, CASE WHEN work_next_eligible_at IS NULL THEN NULL ELSE to_char(work_next_eligible_at AT TIME ZONE 'UTC', " + ISO + ") END AS work_next "
                        + "FROM public.wallet_reward_availability(?::uuid)")
                .param(actor).query().listOfRows().stream().findFirst().orElseThrow(() -> new IllegalStateException("no availability row")));
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("dailyAvailable", Boolean.TRUE.equals(r.get("daily_available")));
        m.put("dailyNextEligibleAt", r.get("daily_next"));
        m.put("workAvailable", Boolean.TRUE.equals(r.get("work_available")));
        m.put("workNextEligibleAt", r.get("work_next"));
        return privateOk(m);
    }

    public static Map<String, Object> equityShape(Map<String, Object> r) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("holdingsAmount", String.valueOf(r.get("holdings_amount")));
        m.put("debtAmount", String.valueOf(r.get("debt_amount")));
        m.put("equityAmount", String.valueOf(r.get("equity_amount")));
        m.put("minimumRatioBps", r.get("minimum_ratio_bps") instanceof Number n ? n.intValue() : 0);
        return m;
    }

    @SuppressWarnings("unchecked")
    private static Object parseJson(Object raw) {
        if (raw == null) return null;
        try { return new com.fasterxml.jackson.databind.ObjectMapper().readValue(raw.toString(), Map.class); }
        catch (Exception e) { return null; }
    }

    private interface Call<T> { T get(); }

    private static <T> T run(Call<T> call) {
        try { return call.get(); }
        catch (ResponseStatusException e) { throw e; }
        catch (RuntimeException e) {
            Throwable c = NestedExceptionUtils.getMostSpecificCause(e);
            log.warn("[member-reads] db call failed: {} {}", c.getClass().getSimpleName(), String.valueOf(c.getMessage()).replaceAll("\\s+", " "));
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "MEMBER_SOURCE_UNAVAILABLE");
        }
    }

    private static ResponseEntity<?> privateOk(Object body) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore().cachePrivate()).body(body);
    }
}
