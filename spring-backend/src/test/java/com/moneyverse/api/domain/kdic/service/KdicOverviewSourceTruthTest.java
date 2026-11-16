package com.moneyverse.api.domain.kdic.service;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class KdicOverviewSourceTruthTest {

    @Test
    void databaseUnavailableNeverReturnsInventedFundOrInstitutions() {
        KdicService service = new KdicService(new JdbcTemplate());
        ResponseStatusException error = assertThrows(ResponseStatusException.class, service::getOverview);
        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, error.getStatusCode());
    }
}
