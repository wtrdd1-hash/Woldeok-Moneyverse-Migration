package com.moneyverse.api.domain.kdic.service;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class KdicFailClosedTest {
    private final JdbcTemplate jdbc = new JdbcTemplate();
    private final KdicService service = new KdicService(jdbc);

    private void unavailable(Runnable action) {
        ResponseStatusException exception = assertThrows(ResponseStatusException.class, action::run);
        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, exception.getStatusCode());
    }

    @Test void ledgerEvidenceMustNotBeFabricated() {
        unavailable(() -> service.getLedgerIntegrity());
    }

    @Test void premiumsMustNotClaimUnjournaledCollection() {
        unavailable(() -> service.assessPremiums("actor"));
    }

    @Test void emergencyLoanMustNotClaimUnjournaledTransfer() {
        unavailable(() -> service.injectEmergencyLiquidity("institution", 100, "actor"));
    }

    @Test void payoutMustNotClaimUnjournaledTransfer() {
        unavailable(() -> service.executePayout("institution", "reason", "actor"));
    }
}
