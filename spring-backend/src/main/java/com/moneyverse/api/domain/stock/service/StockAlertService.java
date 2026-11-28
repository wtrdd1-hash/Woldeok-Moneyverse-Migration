package com.moneyverse.api.domain.stock.service;

import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class StockAlertService {

    private final JdbcTemplate jdbcTemplate;

    @Autowired(required = false)
    public StockAlertService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private static final Set<String> PRICE = Set.of("price_at_or_above", "price_at_or_below");
    private static final Set<String> CHANGE = Set.of("day_change_at_or_above", "day_change_at_or_below");
    private static final Set<String> REFUSALS = Set.of("22023", "23505", "55000", "P0001", "23514");
    private static final java.math.BigInteger BIGINT_MAX = java.math.BigInteger.valueOf(Long.MAX_VALUE);

    // BOLA sweep 2026-11-28: creation returned a random id without storing anything, deletion answered
    // success for any id, events were always empty and a failed list read looked like "no alerts".
    // The owner-scoped SQL functions are the authority, ported from the legacy gateway's repository.

    public List<Map<String, Object>> listAlerts(String userId) {
        String actor = uuid(userId, "user id");
        return db(() -> jdbcTemplate.queryForList(
                "SELECT alert_id::text AS alert_id, stock_id::text AS stock_id, symbol, name, condition_kind, " +
                "threshold_amount::text AS threshold_amount, threshold_bps, cooldown_seconds, " +
                "current_price::text AS current_price, day_open_price::text AS day_open_price, current_day_change_bps, " +
                "condition_met, last_evaluated_at, last_triggered_at, created_at " +
                "FROM public.stock_alert_rules_list(?::uuid)",
                actor));
    }

    public List<Map<String, Object>> listEvents(String userId, int limit) {
        String actor = uuid(userId, "user id");
        int bounded = Math.min(100, Math.max(1, limit));
        return db(() -> jdbcTemplate.queryForList(
                "SELECT event_id::text AS event_id, alert_id::text AS alert_id, stock_id::text AS stock_id, symbol, name, " +
                "condition_kind, threshold_amount::text AS threshold_amount, threshold_bps, " +
                "trigger_price::text AS trigger_price, trigger_day_change_bps, triggered_at " +
                "FROM public.stock_alert_events_list(?::uuid, ?)",
                actor, bounded));
    }

    public Map<String, Object> createAlert(String userId, Map<String, Object> body) {
        String actor = uuid(userId, "user id");
        Map<String, Object> in = body == null ? Map.of() : body;
        String stockId = uuid(in.get("stockId"), "stock id");
        Object kind = in.get("conditionKind");
        if (!(kind instanceof String k) || (!PRICE.contains(k) && !CHANGE.contains(k))) {
            throw bad("unsupported alert condition");
        }
        String amount = null;
        Integer bps = null;
        if (PRICE.contains(k)) {
            if (!(in.get("thresholdAmount") instanceof String a) || !a.matches("^[1-9]\\d{0,18}$")
                    || new java.math.BigInteger(a).compareTo(BIGINT_MAX) > 0) {
                throw bad("price threshold must be a positive integer string");
            }
            if (in.get("thresholdBps") != null) throw bad("price alerts cannot include a change threshold");
            amount = a;
        } else {
            if (!(in.get("thresholdBps") instanceof Integer b) || b < -100_000 || b > 100_000) {
                throw bad("change threshold must be an integer basis-point value");
            }
            if (in.get("thresholdAmount") != null) throw bad("change alerts cannot include a price threshold");
            bps = b;
        }
        Object c = in.containsKey("cooldownSeconds") ? in.get("cooldownSeconds") : Integer.valueOf(3600);
        if (!(c instanceof Integer cooldown) || cooldown < 300 || cooldown > 604_800) {
            throw bad("cooldown must be between 300 and 604800 seconds");
        }
        final String fAmount = amount;
        final Integer fBps = bps;
        String alertId = db(() -> jdbcTemplate.queryForObject(
                "SELECT public.stock_alert_rule_create(?::uuid, ?::uuid, ?, ?::bigint, ?, ?)::text",
                String.class, actor, stockId, k, fAmount, fBps, cooldown));
        if (alertId == null) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "STOCK_ALERT_RECEIPT_MISSING");
        }
        return Map.of("alertId", alertId);
    }

    public Map<String, Object> removeAlert(String userId, String alertId) {
        String actor = uuid(userId, "user id");
        String id = uuid(alertId, "alert id");
        Boolean deleted = db(() -> jdbcTemplate.queryForObject(
                "SELECT public.stock_alert_rule_delete(?::uuid, ?::uuid)", Boolean.class, actor, id));
        // The function deletes only the caller's own rule; false means nothing of theirs was removed.
        return Map.of("deleted", Boolean.TRUE.equals(deleted));
    }

    private static String uuid(Object value, String label) {
        if (value instanceof String s) {
            try { return UUID.fromString(s).toString(); } catch (IllegalArgumentException ignored) { }
        }
        throw bad(label + " must be a UUID");
    }

    private static ResponseStatusException bad(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }

    private <T> T db(java.util.function.Supplier<T> call) {
        if (jdbcTemplate == null) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "STOCK_ALERTS_UNAVAILABLE");
        }
        try {
            return call.get();
        } catch (RuntimeException e) {
            Throwable cause = org.springframework.core.NestedExceptionUtils.getMostSpecificCause(e);
            if (cause instanceof java.sql.SQLException sql && sql.getSQLState() != null && REFUSALS.contains(sql.getSQLState())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "STOCK_ALERT_REFUSED");
            }
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "STOCK_ALERTS_UNAVAILABLE");
        }
    }
}
