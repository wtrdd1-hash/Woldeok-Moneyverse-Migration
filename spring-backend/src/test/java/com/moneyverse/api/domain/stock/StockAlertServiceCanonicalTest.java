package com.moneyverse.api.domain.stock;

import com.moneyverse.api.domain.stock.service.StockAlertService;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * BOLA sweep 2026-11-28: alert creation returned a random id without storing anything, deletion
 * answered success for any id without checking ownership, events were always empty and a failed
 * list read was shown as "no alerts". The owner-scoped SQL functions (stock_alert_rule_create,
 * stock_alert_rule_delete, stock_alert_events_list, stock_alert_rules_list) are the authority, as
 * in the legacy gateway.
 */
class StockAlertServiceCanonicalTest {
    private final JdbcTemplate jdbc = mock(JdbcTemplate.class);
    private final StockAlertService service = new StockAlertService(jdbc);
    private final String actor = UUID.randomUUID().toString();
    private final String stock = UUID.randomUUID().toString();

    private static int status(org.junit.jupiter.api.function.Executable call) {
        return assertThrows(ResponseStatusException.class, call).getStatusCode().value();
    }

    @Test void deletionIsOwnerScopedByTheFunctionAndReportsWhatHappened() {
        String alert = UUID.randomUUID().toString();
        when(jdbc.queryForObject(contains("stock_alert_rule_delete"), eq(Boolean.class), eq(actor), eq(alert)))
                .thenReturn(false);
        assertEquals(Map.of("deleted", false), service.removeAlert(actor, alert));
    }

    @Test void deletionRejectsANonUuidId() {
        assertEquals(400, status(() -> service.removeAlert(actor, "not-a-uuid")));
        verifyNoInteractions(jdbc);
    }

    @Test void creationReturnsTheStoredIdNotARandomOne() {
        String stored = UUID.randomUUID().toString();
        when(jdbc.queryForObject(contains("stock_alert_rule_create"), eq(String.class),
                eq(actor), eq(stock), eq("price_at_or_above"), eq("12000"), isNull(), eq(3600)))
                .thenReturn(stored);
        Map<String, Object> r = service.createAlert(actor,
                Map.of("stockId", stock, "conditionKind", "price_at_or_above", "thresholdAmount", "12000"));
        assertEquals(Map.of("alertId", stored), r);
    }

    @Test void creationValidatesLikeTheLegacyGateway() {
        assertEquals(400, status(() -> service.createAlert(actor, Map.of("stockId", stock, "conditionKind", "nope"))));
        assertEquals(400, status(() -> service.createAlert(actor,
                Map.of("stockId", stock, "conditionKind", "price_at_or_above", "thresholdAmount", "1.5"))));
        assertEquals(400, status(() -> service.createAlert(actor,
                Map.of("stockId", stock, "conditionKind", "day_change_at_or_above", "thresholdBps", 500, "thresholdAmount", "1"))));
        assertEquals(400, status(() -> service.createAlert(actor,
                Map.of("stockId", stock, "conditionKind", "price_at_or_above", "thresholdAmount", "1", "cooldownSeconds", 10))));
        verifyNoInteractions(jdbc);
    }

    @Test void eventsComeFromTheOwnerScopedFunction() {
        when(jdbc.queryForList(contains("stock_alert_events_list"), eq(actor), eq(5)))
                .thenReturn(List.of(Map.of("event_id", "e1")));
        assertEquals(1, service.listEvents(actor, 5).size());
    }

    @Test void aFailedListReadIsUnavailableNotEmpty() {
        when(jdbc.queryForList(contains("stock_alert_rules_list"), eq(actor)))
                .thenThrow(new DataAccessResourceFailureException("down"));
        assertEquals(503, status(() -> service.listAlerts(actor)));
    }
}
