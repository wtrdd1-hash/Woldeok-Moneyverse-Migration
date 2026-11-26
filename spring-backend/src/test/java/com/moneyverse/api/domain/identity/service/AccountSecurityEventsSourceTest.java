package com.moneyverse.api.domain.identity.service;

import org.junit.jupiter.api.Test;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Security events come from account_recent_security_events (214). The former direct query named
 * columns the table does not have and answered an empty list on every failure, which a member
 * would read as "no sign-ins recorded".
 */
class AccountSecurityEventsSourceTest {
    @Test void readsThroughTheActorBoundFunction() {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        UUID actor = UUID.randomUUID();
        new AccountSecurityService(jdbc).getSecurityEvents(actor, "all", "recent");
        verify(jdbc).query(contains("public.account_recent_security_events(?::uuid, ?)"), any(RowMapper.class), eq(actor), anyInt());
    }

    @Test void anUnreadableSourceIsNotAnEmptyHistory() {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        when(jdbc.query(anyString(), any(RowMapper.class), any(), any())).thenThrow(new DataAccessResourceFailureException("down"));
        var e = assertThrows(ResponseStatusException.class,
                () -> new AccountSecurityService(jdbc).getSecurityEvents(UUID.randomUUID(), "all", "recent"));
        assertEquals(503, e.getStatusCode().value());
    }
}
