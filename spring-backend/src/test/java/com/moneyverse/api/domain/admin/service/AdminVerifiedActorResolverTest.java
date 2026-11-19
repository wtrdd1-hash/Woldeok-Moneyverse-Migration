package com.moneyverse.api.domain.admin.service;

import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.mock.web.MockHttpServletRequest;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class AdminVerifiedActorResolverTest {
    private final JdbcTemplate jdbc = mock(JdbcTemplate.class);
    private final AdminAuthService auth = new AdminAuthService(jdbc);

    private MockHttpServletRequest request() {
        var req = new MockHttpServletRequest("GET", "/api/v1/admin/users");
        req.setCookies(new Cookie("mv_session", "synthetic-validated-session"));
        return req;
    }

    @SuppressWarnings("unchecked")
    @Test void verifiedNonRevokedSessionWithCurrentRoleReturnsRealActor() {
        var actor = UUID.randomUUID();
        when(jdbc.queryForObject(anyString(), eq(String.class), anyString())).thenReturn(actor.toString());
        when(jdbc.query(anyString(), any(RowMapper.class), eq(actor))).thenReturn(List.of("superadmin"));
        assertEquals(actor, auth.resolveVerifiedAdminActor(request()).orElseThrow());
    }

    @SuppressWarnings("unchecked")
    @Test void revokedRoleCannotReadAdminDataEvenWithStoredSession() {
        var actor = UUID.randomUUID();
        when(jdbc.queryForObject(anyString(), eq(String.class), anyString())).thenReturn(actor.toString());
        when(jdbc.query(anyString(), any(RowMapper.class), eq(actor))).thenReturn(List.of());
        assertTrue(auth.resolveVerifiedAdminActor(request()).isEmpty());
    }

    @Test void rawHeaderWithoutDatabaseSessionCannotResolveAdminActor() {
        var req = new MockHttpServletRequest("GET", "/api/v1/admin/users");
        req.addHeader("x-internal-token", "unverified");
        assertTrue(auth.resolveVerifiedAdminActor(req).isEmpty());
        verifyNoInteractions(jdbc);
    }
}
