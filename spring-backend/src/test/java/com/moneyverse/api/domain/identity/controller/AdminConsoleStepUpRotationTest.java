package com.moneyverse.api.domain.identity.controller;

import com.moneyverse.api.domain.admin.service.AdminAuthService;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Opening the console stamped reauthenticated_at = now on the rotated session, so a click counted
 * as password re-verification and any step-up check would pass without one. The rotated session
 * now inherits the previous session's timestamp (null when there was none), and a failed rotation
 * issues no cookie.
 */
class AdminConsoleStepUpRotationTest {
    private static AdminAuthService admin(UUID actor) {
        AdminAuthService auth = mock(AdminAuthService.class);
        when(auth.isAuthorizedAdmin(any())).thenReturn(true);
        when(auth.resolveVerifiedAdminActor(any())).thenReturn(Optional.of(actor));
        when(auth.extractSessionToken(any())).thenReturn("old-session");
        return auth;
    }

    @Test void rotationInheritsTheReauthenticationTimeInsteadOfMintingOne() {
        UUID actor = UUID.randomUUID();
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        when(jdbc.queryForList(contains("reauthenticated_at"), eq(AdminAuthService.sha256("old-session")), eq(actor)))
                .thenReturn(List.of(new java.util.HashMap<>(Map.of("id", UUID.randomUUID())) {{ put("reauthenticated_at", null); }}));
        when(jdbc.update(anyString(), any(Object[].class))).thenReturn(1);
        var response = new MockHttpServletResponse();
        var opened = new AdminSecurityController(admin(actor), jdbc).openConsoleSession(new MockHttpServletRequest(), response);
        assertEquals(200, opened.getStatusCode().value());
        var captor = org.mockito.ArgumentCaptor.forClass(Object.class);
        verify(jdbc).update(contains("INSERT INTO auth_sessions"), any(), any(), any(), any(), any(), any(), any(), any(), captor.capture());
        assertNull(captor.getValue());
    }

    @Test void anInheritedTimestampIsCarriedUnchanged() {
        UUID actor = UUID.randomUUID();
        Timestamp at = Timestamp.from(Instant.now().minusSeconds(120));
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        when(jdbc.queryForList(contains("reauthenticated_at"), eq(AdminAuthService.sha256("old-session")), eq(actor)))
                .thenReturn(List.of(Map.of("id", UUID.randomUUID(), "reauthenticated_at", at)));
        when(jdbc.update(anyString(), any(Object[].class))).thenReturn(1);
        new AdminSecurityController(admin(actor), jdbc).openConsoleSession(new MockHttpServletRequest(), new MockHttpServletResponse());
        var captor = org.mockito.ArgumentCaptor.forClass(Object.class);
        verify(jdbc).update(contains("INSERT INTO auth_sessions"), any(), any(), any(), any(), any(), any(), any(), any(), captor.capture());
        assertEquals(at, captor.getValue());
    }

    @Test void aFailedRotationIssuesNoCookie() {
        UUID actor = UUID.randomUUID();
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        when(jdbc.queryForList(contains("reauthenticated_at"), eq(AdminAuthService.sha256("old-session")), eq(actor))).thenReturn(List.of(Map.of("id", UUID.randomUUID())));
        when(jdbc.update(contains("INSERT INTO auth_sessions"), any(Object[].class))).thenThrow(new DataAccessResourceFailureException("down"));
        var response = new MockHttpServletResponse();
        var opened = new AdminSecurityController(admin(actor), jdbc).openConsoleSession(new MockHttpServletRequest(), response);
        assertEquals(503, opened.getStatusCode().value());
        assertTrue(response.getHeaders("Set-Cookie").isEmpty());
        verify(jdbc, never()).update(contains("revoked_at = NOW()"), any(Object[].class));
    }
}
