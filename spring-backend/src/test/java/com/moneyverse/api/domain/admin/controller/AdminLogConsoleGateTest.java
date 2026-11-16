package com.moneyverse.api.domain.admin.controller;

import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AdminLogConsoleGateTest {
    private final JdbcTemplate jdbc = mock(JdbcTemplate.class);
    private final AdminLogConsoleGate gate = new AdminLogConsoleGate(jdbc);
    private final UUID session = UUID.randomUUID();
    private final UUID actor = UUID.randomUUID();

    @Test
    void onlyAnExistingOpenConsoleSessionIsAuthorized() {
        String query = "SELECT state FROM public.admin_session_touch(?, ?)";
        when(jdbc.queryForObject(query, String.class, session, actor)).thenReturn("open", "idle_locked", "closed");
        assertTrue(gate.isOpen(session, actor));
        assertFalse(gate.isOpen(session, actor));
        assertFalse(gate.isOpen(session, actor));
    }

    @Test
    void missingSessionAndDatabaseErrorFailClosed() {
        assertFalse(gate.isOpen(null, actor));
        verifyNoInteractions(jdbc);
        when(jdbc.queryForObject("SELECT state FROM public.admin_session_touch(?, ?)", String.class, session, actor))
                .thenThrow(new org.springframework.dao.DataAccessResourceFailureException("unavailable"));
        assertFalse(gate.isOpen(session, actor));
    }
}
