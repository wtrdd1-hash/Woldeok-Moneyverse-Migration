package com.moneyverse.api.domain.kdic.service;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Deposit insurance is deliberately closed (PRODUCT.md) and its tables are not granted to the
 * application role. The overview, which also serves the unauthenticated portal routes, answers
 * the closed state without reading any of them, so no payout row can reach a caller.
 */
class KdicOverviewClosedTest {
    @Test void overviewIsClosedAndReadsNothing() {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        var error = assertThrows(ResponseStatusException.class, () -> new KdicService(jdbc).getOverview());
        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, error.getStatusCode());
        verifyNoInteractions(jdbc);
    }
}
