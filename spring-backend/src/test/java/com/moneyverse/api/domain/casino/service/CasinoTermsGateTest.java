package com.moneyverse.api.domain.casino.service;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/** Terms and fairness ask the switch first, as NestJS does: a closed casino discloses nothing. */
class CasinoTermsGateTest {
    private static CasinoLedgerService withState(String state) {
        CasinoLedgerService s = spy(new CasinoLedgerService(mock(JdbcClient.class)));
        doReturn(state).when(s).switchState();
        return s;
    }

    @Test void disabledCasinoIsForbiddenBeforeAnyTermsRead() {
        var s = withState("disabled");
        var e = assertThrows(ResponseStatusException.class, () -> s.coinTerms(UUID.randomUUID()));
        assertEquals(HttpStatus.FORBIDDEN, e.getStatusCode());
        assertThrows(ResponseStatusException.class, s::coinFairness);
        assertThrows(ResponseStatusException.class, () -> s.gameTerms(UUID.randomUUID()));
        assertThrows(ResponseStatusException.class, s::diceFairness);
    }

    @Test void pausedAndUnreadableAreUnavailable() {
        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, assertThrows(ResponseStatusException.class, withState("paused")::coinFairness).getStatusCode());
        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, assertThrows(ResponseStatusException.class, withState("unknown")::coinFairness).getStatusCode());
    }
}
