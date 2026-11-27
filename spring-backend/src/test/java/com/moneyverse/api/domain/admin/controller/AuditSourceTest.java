package com.moneyverse.api.domain.admin.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneyverse.api.domain.identity.service.UserAuthService;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * audit_logs is not readable by the application role at all (AGENTS.md); the console reads
 * admin_search_audit_events with the verified administrator, and only an administrator session counts.
 */
class AuditSourceTest {
    private static UserAuthService adminSession(UUID id) {
        UserAuthService auth = mock(UserAuthService.class);
        var session = new UserAuthService.SessionInfo();
        session.setUserId(id);
        session.setRoles(List.of("SUPERADMIN"));
        when(auth.resolveSession(any())).thenReturn(Optional.of(session));
        return auth;
    }

    @Test void eventsComeFromTheRoleCheckedSearchFunction() {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        UUID admin = UUID.randomUUID();
        new AuditController(adminSession(admin), jdbc, new ObjectMapper())
                .getAuditEvents(new MockHttpServletRequest(), null, 30, null, null, null, null, null, null, null);
        verify(jdbc).queryForList(contains("public.admin_search_audit_events(?::uuid,"), eq(admin), isNull(), isNull(), isNull(),
                isNull(), isNull(), isNull(), isNull(), isNull(), eq(30));
    }

    @Test void aRequestWithoutAnAdministratorSessionIsRefused() {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        UserAuthService auth = mock(UserAuthService.class);
        when(auth.resolveSession(any())).thenReturn(Optional.empty());
        var request = new MockHttpServletRequest();
        request.addHeader("x-internal-token", "anything");
        assertThrows(ResponseStatusException.class, () -> new AuditController(auth, jdbc, new ObjectMapper())
                .getAuditEvents(request, null, 30, null, null, null, null, null, null, null));
        verifyNoInteractions(jdbc);
    }

    @Test void financialEventsAreNotInvented() {
        var e = assertThrows(ResponseStatusException.class, () -> new AuditController(adminSession(UUID.randomUUID()),
                mock(JdbcTemplate.class), new ObjectMapper()).getFinancialEvents(new MockHttpServletRequest()));
        assertEquals(503, e.getStatusCode().value());
    }
}
