package com.moneyverse.api.domain.wallet.service;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class WalletSourceCompletenessTest {
    private final UUID owner = UUID.randomUUID();
    private final JdbcTemplate jdbc = mock(JdbcTemplate.class);
    private final WalletService service = new WalletService(jdbc);

    private Map<String,Object> row(String type, Object amount) {
        Map<String,Object> row = new HashMap<>();
        row.put("account_type", type);
        row.put("amount", amount);
        return row;
    }
    private void balances(List<Map<String,Object>> rows) {
        when(jdbc.queryForList(anyString(), any(Object[].class))).thenAnswer(invocation -> {
            String sql = invocation.getArgument(0);
            if (!sql.contains("FROM accounts a")) return List.of();
            // Model LEFT JOIN semantics: COALESCE hides a missing projection as zero.
            if (sql.contains("COALESCE(b.available_amount, 0)")) {
                return rows.stream().map(r -> row((String) r.get("account_type"),
                        r.get("amount") == null ? BigDecimal.ZERO : r.get("amount"))).toList();
            }
            return rows;
        });
    }
    @Test void missingBalanceProjectionFailsClosed() {
        balances(List.of(row("USER_CASH", null), row("USER_BANK", BigDecimal.TEN)));
        assertEquals(HttpStatus.SERVICE_UNAVAILABLE,
                assertThrows(ResponseStatusException.class, () -> service.getOverview(owner.toString())).getStatusCode());
    }
    @Test void missingBankAccountCannotProducePartialTotal() {
        balances(List.of(row("USER_CASH", BigDecimal.TEN)));
        assertThrows(ResponseStatusException.class, () -> service.getOverview(owner.toString()));
    }
    @Test void duplicateAccountTypeCannotSilentlyReplaceAmount() {
        balances(List.of(row("USER_CASH", BigDecimal.ONE), row("USER_CASH", BigDecimal.TEN), row("USER_BANK", BigDecimal.ZERO)));
        assertThrows(ResponseStatusException.class, () -> service.getOverview(owner.toString()));
    }
    @Test void verifiedZeroAndLargeBalancesRemainExact() {
        balances(List.of(row("USER_CASH", new BigDecimal("99999999999999999999999999999999999999")), row("USER_BANK", BigDecimal.ZERO)));
        var result = service.getOverview(owner.toString());
        assertEquals("99999999999999999999999999999999999999", result.getBalanceWld());
        assertEquals("0", result.getLockedBalanceWld());
    }
}
