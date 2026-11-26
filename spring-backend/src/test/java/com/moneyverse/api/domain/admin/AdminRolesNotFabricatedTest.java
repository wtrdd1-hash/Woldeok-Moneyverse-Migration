package com.moneyverse.api.domain.admin;

import com.moneyverse.api.domain.admin.service.AdminAuthService;
import com.moneyverse.api.domain.identity.controller.AdminSecurityController;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.mock.web.MockHttpServletRequest;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * 2026-11-26: /admin/me and /admin/security answered every administrator role (superadmin
 * included) whenever the real roles could not be read, and role lookup fell back to a table the
 * migration chain does not grant. Roles now come only from admin_current_roles; when they cannot
 * be read the endpoints say so instead of inventing them.
 */
class AdminRolesNotFabricatedTest {
    private final UUID admin = UUID.randomUUID();

    private AdminAuthService auth(List<String> roles) {
        AdminAuthService auth = mock(AdminAuthService.class);
        when(auth.isAuthorizedAdmin(any())).thenReturn(true);
        when(auth.resolveAdminUserId(any())).thenReturn(Optional.of(admin));
        when(auth.getAdminRolesForUser(admin)).thenReturn(roles);
        return auth;
    }

    @Test void meReturnsOnlyTheRealRoles() {
        var c = new AdminSecurityController(auth(List.of("operator")), mock(JdbcTemplate.class));
        var r = c.getAdminMe(new MockHttpServletRequest());
        assertEquals(200, r.getStatusCode().value());
        assertEquals(List.of("operator"), ((Map<?, ?>) r.getBody()).get("roles"));
    }

    @Test void unreadableRolesAreNotInvented() {
        var c = new AdminSecurityController(auth(List.of()), mock(JdbcTemplate.class));
        for (var r : List.of(c.getAdminMe(new MockHttpServletRequest()), c.getSecurityOverview(new MockHttpServletRequest()))) {
            assertEquals(503, r.getStatusCode().value());
            assertFalse(String.valueOf(r.getBody()).contains("superadmin"));
        }
    }

    @SuppressWarnings("unchecked")
    @Test void roleLookupFailureFailsClosedWithoutAFallbackTable() {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        when(jdbc.query(anyString(), any(RowMapper.class), any(Object[].class))).thenThrow(new IllegalStateException("db down"));
        assertEquals(List.of(), new AdminAuthService(jdbc).getAdminRolesForUser(admin));
        verify(jdbc, never()).query(contains("user_roles"), any(RowMapper.class), any(Object[].class));
    }
}
