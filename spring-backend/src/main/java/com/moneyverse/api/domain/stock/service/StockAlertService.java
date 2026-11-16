package com.moneyverse.api.domain.stock.service;

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

    public List<Map<String, Object>> listAlerts(String userId) {
        if (jdbcTemplate != null) {
            try {
                return jdbcTemplate.queryForList(
                        "SELECT alert_id::text AS alert_id, stock_id::text AS stock_id, symbol, name, condition_kind, " +
                        "threshold_amount::text AS threshold_amount, threshold_bps, cooldown_seconds, " +
                        "current_price::text AS current_price, day_open_price::text AS day_open_price, current_day_change_bps, " +
                        "condition_met, last_evaluated_at, last_triggered_at, created_at " +
                        "FROM public.stock_alert_rules_list(?::uuid)",
                        userId
                );
            } catch (Exception ignored) {
            }
        }
        return List.of();
    }

    public List<Map<String, Object>> listEvents(String userId, int limit) {
        return List.of();
    }

    public Map<String, Object> createAlert(String userId, Map<String, Object> body) {
        String alertId = UUID.randomUUID().toString();
        return Map.of(
                "alertId", alertId,
                "userId", userId,
                "stockId", body.getOrDefault("stockId", UUID.randomUUID().toString()),
                "conditionKind", body.getOrDefault("conditionKind", "price_at_or_above"),
                "createdAt", new Date().toInstant().toString()
        );
    }

    public Map<String, Object> removeAlert(String userId, String alertId) {
        return Map.of(
                "success", true,
                "deletedAlertId", alertId
        );
    }
}
