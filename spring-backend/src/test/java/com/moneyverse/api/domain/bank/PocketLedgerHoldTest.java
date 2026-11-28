package com.moneyverse.api.domain.bank;

import com.moneyverse.api.domain.bank.service.PocketService;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.server.ResponseStatusException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Security review 2026-11-25: pocket deposits raised the pocket balance without
 * debiting cash and withdrawals lowered it without crediting cash; archiving set
 * the balance to 0. No double-entry pocket path exists in the DB either, so
 * money-moving pocket operations are refused and never touch a table.
 */
class PocketLedgerHoldTest {
    final JdbcTemplate jdbc = mock(JdbcTemplate.class);
    final PocketService service = new PocketService(jdbc);
    static final String USER = "00000000-0000-4000-8000-000000000123";
    static final String POCKET = "11111111-1111-4111-8111-111111111111";

    @Test void transferIsRefusedWithoutTouchingBalances() {
        var e = assertThrows(ResponseStatusException.class, () -> service.transferPocket(USER, POCKET, "IN", 1000L));
        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, e.getStatusCode());
        verifyNoInteractions(jdbc);
    }

    @Test void archiveIsRefusedWithoutZeroingABalance() {
        var e = assertThrows(ResponseStatusException.class, () -> service.archivePocket(USER, POCKET));
        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, e.getStatusCode());
        verifyNoInteractions(jdbc);
    }
}
