package com.moneyverse.api.domain.identity.controller;

import com.moneyverse.api.domain.admin.service.AdminAuthService;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Opening the console bound the new session to a fixed fallback user whenever the second user-id
 * lookup came back empty (a session revoked between the two reads, a transient database error).
 * It now binds to the verified administrator or issues nothing.
 */
class AdminConsoleSessionActorTest {
    @Test void anUnresolvableActorIssuesNoSession() {
        AdminAuthService auth = mock(AdminAuthService.class);
        when(auth.isAuthorizedAdmin(any())).thenReturn(true);
        when(auth.resolveVerifiedAdminActor(any())).thenReturn(Optional.empty());
        when(auth.resolveAdminUserId(any())).thenReturn(Optional.empty());
        when(auth.unauthorizedResponse()).thenCallRealMethod();
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        var response = new AdminSecurityController(auth, jdbc).openConsoleSession(new MockHttpServletRequest(), new MockHttpServletResponse());
        assertEquals(401, response.getStatusCode().value());
        verify(jdbc, never()).update(contains("INSERT INTO auth_sessions"), any(Object[].class));
    }
}
