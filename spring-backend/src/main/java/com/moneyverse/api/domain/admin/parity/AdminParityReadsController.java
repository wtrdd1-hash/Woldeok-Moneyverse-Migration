package com.moneyverse.api.domain.admin.parity;

import com.moneyverse.api.domain.admin.service.AdminAuthService;
import com.moneyverse.api.domain.earlygame.controller.EarlyGameReadsController;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
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
 * Administrator console reads the Next admin pages call but Spring lacked (route contract
 * 2026-11-26). Each is the NestJS query verbatim (admin_* SECURITY DEFINER functions or the
 * read-only views/tables NestJS selected), shaped as node-pg returned it. Behind
 * AdminApiBoundaryFilter (verified admin session); the actor for actor-scoped functions comes
 * from the verified admin session. Invented figures in the NestJS originals are not ported.
 */
@Tag(name = "Admin parity reads")
@RestController
public class AdminParityReadsController {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(AdminParityReadsController.class);
    private final JdbcClient jdbc;
    private final AdminAuthService admin;

    public AdminParityReadsController(JdbcClient jdbc, AdminAuthService admin) {
        this.jdbc = jdbc;
        this.admin = admin;
    }

    @GetMapping({"/api/v1/admin/business-types", "/api/admin/business-types"})
    @Operation(summary = "Business catalogue for administrators")
    public ResponseEntity<?> businessTypes(HttpServletRequest request) {
        UUID actor = actor(request);
        return ok(Map.of("businessTypes", rows("SELECT id::text AS id, symbol, name, description, purchase_cost::text AS purchase_cost, "
                + "daily_revenue::text AS daily_revenue, daily_operating_cost::text AS daily_operating_cost, active FROM public.business_admin_list(?::uuid)", actor)));
    }

    @GetMapping({"/api/v1/admin/season-events", "/api/admin/season-events"})
    @Operation(summary = "Season events for administrators")
    public ResponseEntity<?> seasonEvents(HttpServletRequest request) {
        UUID actor = actor(request);
        return ok(Map.of("events", rows("SELECT id::text AS id, season_name, title, description, cost_wld::text AS cost_wld, points_per_entry, active, ends_at "
                + "FROM public.season_event_admin_list(?::uuid)", actor)));
    }

    @GetMapping({"/api/v1/admin/stocks/dynamics", "/api/admin/stocks/dynamics"})
    @Operation(summary = "Stock price dynamics for administrators")
    public ResponseEntity<?> stockDynamics(HttpServletRequest request) {
        UUID actor = actor(request);
        return ok(Map.of("stocks", rows("SELECT stock_id::text AS stock_id, symbol, name, current_price::text AS current_price, fair_value::text AS fair_value, "
                + "trend_bps::text AS trend_bps, vol_bps::text AS vol_bps, market_trend_bps::text AS market_trend_bps, live_events "
                + "FROM public.stock_market_dynamics_admin(?::uuid)", actor)));
    }

    @GetMapping({"/api/v1/admin/stocks/market-events", "/api/admin/stocks/market-events"})
    @Operation(summary = "Stock market events for administrators")
    public ResponseEntity<?> stockMarketEvents(HttpServletRequest request, @RequestParam(value = "limit", required = false) String limit) {
        UUID actor = actor(request);
        int n = limit(limit, 50, 200);
        return ok(Map.of("events", rows("SELECT id::text AS id, stock_id::text AS stock_id, symbol, name, direction, strength, headline, body, source, "
                + "starts_at, ends_at, cancelled_at, live FROM public.stock_market_events_admin_list(?::uuid, ?)", actor, n)));
    }

    @GetMapping({"/api/v1/admin/economy/monetary/orders", "/api/v1/admin/economy/monetary/policy-orders"})
    @Operation(summary = "Monetary policy orders")
    public ResponseEntity<?> monetaryOrders(HttpServletRequest request, @RequestParam(value = "limit", required = false) String limit) {
        actor(request);
        return ok(rows("SELECT * FROM public.monetary_policy_orders ORDER BY created_at DESC LIMIT ?", limit(limit, 20, 50)));
    }

    @GetMapping({"/api/v1/admin/economy/monetary/certificates/mints", "/api/v1/admin/economy/monetary/mint-certificates"})
    @Operation(summary = "Mint certificates")
    public ResponseEntity<?> mintCertificates(HttpServletRequest request, @RequestParam(value = "limit", required = false) String limit) {
        actor(request);
        return ok(rows("SELECT * FROM public.mint_certificates ORDER BY created_at DESC LIMIT ?", limit(limit, 20, 50)));
    }

    @GetMapping({"/api/v1/admin/economy/monetary/certificates/retirements", "/api/v1/admin/economy/monetary/retirement-certificates"})
    @Operation(summary = "Retirement certificates")
    public ResponseEntity<?> retirementCertificates(HttpServletRequest request, @RequestParam(value = "limit", required = false) String limit) {
        actor(request);
        return ok(rows("SELECT * FROM public.retirement_certificates ORDER BY created_at DESC LIMIT ?", limit(limit, 20, 50)));
    }

    @GetMapping("/api/v1/admin/enterprises/soes")
    @Operation(summary = "State-owned enterprises")
    public ResponseEntity<?> soes(HttpServletRequest request) {
        actor(request);
        return ok(rows("SELECT id, code, name, category, ceo_name, total_assets_wld::text AS total_assets_wld, operating_revenue_hourly_wld::text AS operating_revenue_hourly_wld, "
                + "operating_cost_hourly_wld::text AS operating_cost_hourly_wld, net_profit_hourly_wld::text AS net_profit_hourly_wld, dividend_rate_bps, eval_grade, eval_score, "
                + "status, description, created_at::text AS created_at, updated_at::text AS updated_at FROM public.state_enterprises ORDER BY total_assets_wld DESC"));
    }

    @GetMapping("/api/v1/admin/enterprises/private")
    @Operation(summary = "Private enterprises")
    public ResponseEntity<?> privateEnterprises(HttpServletRequest request) {
        actor(request);
        return ok(rows("SELECT id, symbol, name, sector, stage, valuation_wld::text AS valuation_wld, revenue_hourly_wld::text AS revenue_hourly_wld, corporate_tax_rate_bps, "
                + "tax_paid_total_wld::text AS tax_paid_total_wld, dividends_paid_total_wld::text AS dividends_paid_total_wld, active, created_at::text AS created_at, "
                + "updated_at::text AS updated_at FROM public.private_enterprises ORDER BY valuation_wld DESC"));
    }

    @GetMapping("/api/v1/admin/enterprises/dividend-logs")
    @Operation(summary = "Recent state-enterprise dividend history")
    public ResponseEntity<?> dividendLogs(HttpServletRequest request, @RequestParam(value = "limit", required = false) String limit) {
        UUID actor = actor(request);
        return ok(rows("SELECT * FROM public.admin_soe_dividend_history_read(?::uuid, ?::integer)", actor, limit(limit, 20, 100)));
    }

    @GetMapping({"/api/v1/admin/ai-news/batches/latest", "/api/admin/ai-news/batches/latest"})
    @Operation(summary = "Latest AI news batch and run")
    public ResponseEntity<?> aiNewsLatest(HttpServletRequest request) {
        UUID actor = actor(request);
        List<Map<String, Object>> batch = rows("SELECT batch_id::text AS batch_id, created_at, operator_prompt, model, scenarios FROM public.ai_news_batch_latest(?::uuid)", actor);
        List<Map<String, Object>> run = rows("SELECT run_id::text AS run_id, started_at, finished_at, operator_prompt, batch_id::text AS batch_id, failure_code, failure_detail, running "
                + "FROM public.ai_news_run_latest(?::uuid)", actor);
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("batch", batch.isEmpty() ? null : batch.get(0));
        out.put("run", run.isEmpty() ? null : run.get(0));
        return ok(out);
    }

    @GetMapping({"/api/v1/admin/economy/tax-policy", "/api/admin/economy/tax-policy"})
    @Operation(summary = "Tax policy configuration and collected revenue by tax type")
    public ResponseEntity<?> taxPolicy(HttpServletRequest request) {
        actor(request);
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("configs", rows("SELECT id, tax_type, name, base_rate_bps, current_rate_bps, min_rate_bps, max_rate_bps, auto_adjust_enabled, tier_multipliers, "
                + "last_adjusted_at, updated_at FROM public.tax_policy_configs ORDER BY tax_type ASC"));
        out.put("summary", rows("SELECT tax_type, COUNT(*)::text AS tx_count, COALESCE(SUM(tax_amount_wld), 0)::text AS total_tax_wld, "
                + "COALESCE(SUM(vault_main_portion_wld), 0)::text AS vault_main_wld, COALESCE(SUM(vault_welfare_portion_wld), 0)::text AS vault_welfare_wld "
                + "FROM public.tax_revenue_ledger GROUP BY tax_type"));
        return ok(out);
    }

    @GetMapping({"/api/v1/admin/economy/stats", "/api/admin/economy/stats"})
    @Operation(summary = "Faucet/sink summary and the last 30 days")
    public ResponseEntity<?> economyStats(HttpServletRequest request) {
        actor(request);
        List<Map<String, Object>> summary = rows("SELECT total_minted::text AS total_minted, total_burned::text AS total_burned, total_circulating::text AS total_circulating, "
                + "today_minted::text AS today_minted, today_burned::text AS today_burned FROM public.v_economy_summary");
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("summary", summary.isEmpty() ? Map.of() : summary.get(0));
        out.put("daily", rows("SELECT stat_date::text AS stat_date, faucet_amount::text AS faucet_amount, sink_amount::text AS sink_amount, tax_amount::text AS tax_amount, "
                + "net_change::text AS net_change, sink_ratio_percent::text AS sink_ratio_percent FROM public.v_daily_economy_stats ORDER BY stat_date DESC LIMIT 30"));
        return ok(out);
    }

    // ---- internals ----

    private UUID actor(HttpServletRequest request) {
        return admin.resolveVerifiedAdminActor(request)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "admin_session_required"));
    }

    static int limit(String raw, int fallback, int max) {
        if (raw == null) return fallback;
        if (!raw.matches("^[1-9][0-9]{0,4}$")) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "limit must be a positive integer");
        int n = Integer.parseInt(raw);
        if (n > max) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "limit must be at most " + max);
        return n;
    }

    private List<Map<String, Object>> rows(String sql, Object... params) {
        try {
            var spec = jdbc.sql(sql);
            for (Object p : params) spec = spec.param(p);
            List<Map<String, Object>> out = new ArrayList<>();
            for (Map<String, Object> r : spec.query().listOfRows()) out.add(EarlyGameReadsController.nodeShape(r));
            return out;
        } catch (RuntimeException e) {
            Throwable c = NestedExceptionUtils.getMostSpecificCause(e);
            log.warn("[admin-parity] db call failed: {} {}", c.getClass().getSimpleName(), String.valueOf(c.getMessage()).replaceAll("\\s+", " "));
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "ADMIN_SOURCE_UNAVAILABLE");
        }
    }

    private static ResponseEntity<?> ok(Object body) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore().cachePrivate()).body(body);
    }
}
