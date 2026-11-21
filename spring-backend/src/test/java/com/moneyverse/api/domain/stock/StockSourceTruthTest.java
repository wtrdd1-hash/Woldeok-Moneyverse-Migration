package com.moneyverse.api.domain.stock;

import com.moneyverse.api.domain.stock.service.StockService;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.server.ResponseStatusException;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class StockSourceTruthTest {
    private final JdbcTemplate jdbc = mock(JdbcTemplate.class);
    private final StockService service = new StockService(jdbc);

    @Test void failedMarketQuoteReadDoesNotReturnSyntheticThreeStocks() {
        when(jdbc.query(anyString(), any(org.springframework.jdbc.core.RowMapper.class)))
                .thenThrow(new IllegalStateException("offline"));
        assertThrows(ResponseStatusException.class, service::list);
    }

    @Test void failedOwnerPortfolioReadDoesNotLookLikeEmptyHoldings() {
        when(jdbc.query(anyString(), any(org.springframework.jdbc.core.RowMapper.class), any(Object[].class)))
                .thenThrow(new IllegalStateException("offline"));
        assertThrows(ResponseStatusException.class, () -> service.portfolio(UUID.randomUUID()));
    }

    @Test void failedWatchlistWriteCannotPretendSuccessfulToggle() {
        when(jdbc.queryForObject(anyString(), eq(Boolean.class), any(Object[].class)))
                .thenThrow(new IllegalStateException("offline"));
        assertThrows(ResponseStatusException.class,
                () -> service.setWatchlist(UUID.randomUUID(), UUID.randomUUID(), true));
    }

    @Test void haltedCheckFailureCannotReturnFabricatedTradeReceipt() {
        when(jdbc.queryForObject(anyString(), eq(String.class), any(Object[].class)))
                .thenThrow(new IllegalStateException("offline"));
        assertThrows(ResponseStatusException.class,
                () -> service.trade(UUID.randomUUID(), UUID.randomUUID(), "buy", 1, UUID.randomUUID()));
    }
}
