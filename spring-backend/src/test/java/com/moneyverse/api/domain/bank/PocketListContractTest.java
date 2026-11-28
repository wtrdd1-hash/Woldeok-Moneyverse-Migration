package com.moneyverse.api.domain.bank;

import com.moneyverse.api.domain.bank.controller.PocketController;
import com.moneyverse.api.domain.bank.service.PocketService;
import com.moneyverse.api.domain.identity.service.UserAuthService;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * The bank page reads /api/v1/banking/pockets as a bare array of SavingPocket (snake_case, money as
 * strings); the list used to arrive wrapped and camelCased, so the page always showed it unavailable.
 * Rows come from bank_owner_pockets (361) because the table is not granted for SELECT.
 */
class PocketListContractTest {
    @Test void listReadsTheActorBoundFunction() {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        UUID actor = UUID.randomUUID();
        new PocketService(jdbc).listPockets(actor.toString());
        verify(jdbc).query(contains("public.bank_owner_pockets(?::uuid)"), any(RowMapper.class), eq(actor));
    }

    @Test void anUnreadableListIsUnavailableNotEmpty() {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        when(jdbc.query(anyString(), any(RowMapper.class), any(Object[].class))).thenThrow(new DataAccessResourceFailureException("down"));
        when(jdbc.query(anyString(), any(RowMapper.class), any(UUID.class))).thenThrow(new DataAccessResourceFailureException("down"));
        var e = assertThrows(ResponseStatusException.class, () -> new PocketService(jdbc).listPockets(UUID.randomUUID().toString()));
        assertEquals(503, e.getStatusCode().value());
    }

    @Test void v1PathAnswersTheBareArrayTheWebReads() {
        PocketService pockets = mock(PocketService.class);
        UserAuthService auth = mock(UserAuthService.class);
        var session = new UserAuthService.SessionInfo();
        session.setUserId(UUID.randomUUID());
        when(auth.resolveSession(any())).thenReturn(Optional.of(session));
        List<Map<String, Object>> rows = List.of(Map.of("pocket_id", "x"));
        when(pockets.listPockets(anyString())).thenReturn(rows);
        var request = new MockHttpServletRequest("GET", "/api/v1/banking/pockets");
        assertSame(rows, new PocketController(pockets, auth).listPockets(request).getBody());
    }
}
