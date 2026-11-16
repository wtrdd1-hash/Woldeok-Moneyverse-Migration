package com.moneyverse.api.domain.admin.controller;

import com.moneyverse.api.domain.identity.service.UserAuthService;
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

class AdminLogIdentityResolverTest {
    private final JdbcTemplate jdbc = mock(JdbcTemplate.class);
    private final AdminLogIdentityResolver resolver = new AdminLogIdentityResolver(jdbc);

    @Test
    void resolvesVerifiedSessionThroughLeastPrivilegeRoleFunction() {
        String cookieValue = "test-token-which-must-never-be-logged";
        var request = new MockHttpServletRequest();
        request.setCookies(new Cookie("mv_session", cookieValue));
        var sessionId = UUID.randomUUID();
        var userId = UUID.randomUUID();
        when(jdbc.queryForObject(eq(AdminLogIdentityResolver.SESSION_SQL), any(RowMapper.class),
                eq(UserAuthService.sha256(cookieValue))))
                .thenReturn(new AdminLogIdentityResolver.SessionIds(sessionId, userId));
        when(jdbc.query(eq(AdminLogIdentityResolver.ROLES_SQL), any(RowMapper.class), eq(userId)))
                .thenReturn(List.of("superadmin"));

        var actual = resolver.resolve(request);
        assertTrue(actual.isPresent());
        assertEquals(sessionId, actual.get().sessionId());
        assertEquals(userId, actual.get().userId());
        assertTrue(actual.get().roles().contains("superadmin"));
        verify(jdbc).query(eq(AdminLogIdentityResolver.ROLES_SQL), any(RowMapper.class), eq(userId));
    }

    @Test
    void missingCookieNeverTouchesDatabase() {
        assertTrue(resolver.resolve(new MockHttpServletRequest()).isEmpty());
        verifyNoInteractions(jdbc);
    }

    @Test
    void databaseFailureFailsClosed() {
        var request = new MockHttpServletRequest();
        request.setCookies(new Cookie("__Host-mv_session", "expired-session"));
        when(jdbc.queryForObject(anyString(), any(RowMapper.class), anyString()))
                .thenThrow(new org.springframework.dao.DataAccessResourceFailureException("read unavailable"));
        assertTrue(resolver.resolve(request).isEmpty());
    }
}
