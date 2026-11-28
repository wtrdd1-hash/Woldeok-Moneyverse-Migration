package com.moneyverse.api.domain.wallet.controller;

import com.moneyverse.api.domain.identity.service.MemberApiGuard;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;

class WalletActivityCursorTest {
    private static final Instant NOW = Instant.parse("2026-11-25T12:00:00Z");
    private final WalletActivityController c = new WalletActivityController(mock(JdbcClient.class), mock(MemberApiGuard.class), new byte[32], () -> NOW);
    private final UUID owner = UUID.randomUUID();

    private String token() {
        return c.sign(owner, "all", "all", null, "2026-11-25T11:59:00.000Z", "2026-11-25T11:00:00.123456Z", UUID.randomUUID().toString());
    }

    @Test void roundTripsForTheSameOwnerAndFilters() {
        assertEquals("2026-11-25T11:00:00.123456Z", c.verify(token(), owner, "all", "all", null, NOW).afterAt());
    }

    @Test void anotherMemberOrFilterOrTamperIsRefused() {
        String t = token();
        assertEquals(HttpStatus.BAD_REQUEST, assertThrows(ResponseStatusException.class, () -> c.verify(t, UUID.randomUUID(), "all", "all", null, NOW)).getStatusCode());
        assertThrows(ResponseStatusException.class, () -> c.verify(t, owner, "7d", "all", null, NOW));
        assertThrows(ResponseStatusException.class, () -> c.verify(t, owner, "all", "in", null, NOW));
        assertThrows(ResponseStatusException.class, () -> c.verify("x" + t, owner, "all", "all", null, NOW));
        var other = new WalletActivityController(mock(JdbcClient.class), mock(MemberApiGuard.class), new byte[]{1}, () -> NOW);
        assertThrows(ResponseStatusException.class, () -> other.verify(t, owner, "all", "all", null, NOW));
    }

    @Test void expiresAfterAnHour() {
        assertThrows(ResponseStatusException.class, () -> c.verify(token(), owner, "all", "all", null, NOW.plusSeconds(3600)));
    }

    @Test void calendarRangeRules() {
        var r = WalletActivityController.range("2026-11-01", "2026-11-25", NOW);
        assertEquals(Instant.parse("2026-10-31T15:00:00Z"), r.since());
        assertEquals(Instant.parse("2026-11-25T15:00:00Z"), r.before());
        assertThrows(ResponseStatusException.class, () -> WalletActivityController.range("2026-11-26", "2026-11-26", NOW));
        assertThrows(ResponseStatusException.class, () -> WalletActivityController.range("2026-11-25", "2026-11-01", NOW));
        assertThrows(ResponseStatusException.class, () -> WalletActivityController.range("2025-01-01", "2026-11-25", NOW));
        assertThrows(ResponseStatusException.class, () -> WalletActivityController.range("2026-11-01", null, NOW));
        assertNull(WalletActivityController.range(null, null, NOW));
    }
}
