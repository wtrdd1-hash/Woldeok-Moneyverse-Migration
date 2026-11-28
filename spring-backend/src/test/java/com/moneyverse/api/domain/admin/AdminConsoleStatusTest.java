package com.moneyverse.api.domain.admin;

import com.moneyverse.api.domain.admin.service.AdminAuthService;
import com.moneyverse.api.domain.identity.controller.AdminSecurityController;
import com.moneyverse.api.domain.identity.service.UserAuthService;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockHttpServletRequest;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * 2026-11-26: /admin/security synthesised the console session (opened "now", expiring in 30 days)
 * and reported reauthentication as active, in a shape the console front door does not read.
 * It now answers the front door's contract from the database: admin_session_touch for the
 * console session, the session row for reauthentication (fresh for five minutes, as the console
 * SQL functions enforce) and admin_login_policy for the actor's own policy.
 */
class AdminConsoleStatusTest {
    private final UUID actor = UUID.randomUUID();
    private final UUID session = UUID.randomUUID();

    private AdminSecurityController controller(JdbcTemplate jdbc) {
        return controller(jdbc, List.of("superadmin"));
    }

    private AdminSecurityController controller(JdbcTemplate jdbc, List<String> roles) {
        AdminAuthService auth = mock(AdminAuthService.class);
        when(auth.isAuthorizedAdmin(any())).thenReturn(true);
        when(auth.resolveAdminUserId(any())).thenReturn(Optional.of(actor));
        when(auth.getAdminRolesForUser(actor)).thenReturn(roles);
        when(auth.extractSessionToken(any())).thenReturn("raw-session-token");
        return new AdminSecurityController(auth, jdbc);
    }

    @Test void consoleStatusComesFromTheDatabase() {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        Instant reauth = Instant.now().minusSeconds(60);
        when(jdbc.queryForList(contains("FROM auth_sessions"), eq(UserAuthService.sha256("raw-session-token")), eq(actor)))
                .thenReturn(List.of(Map.of("id", session, "reauthenticated_at", Timestamp.from(reauth))));
        Instant exp = Instant.parse("2026-12-20T00:00:00Z"), idle = Instant.parse("2026-11-27T00:00:00Z");
        when(jdbc.queryForList(contains("admin_session_touch"), eq(session), eq(actor)))
                .thenReturn(List.of(Map.of("state", "open", "expires_at", Timestamp.from(exp), "idle_expires_at", Timestamp.from(idle))));
        when(jdbc.queryForList(contains("admin_login_policy"), eq(actor), eq(actor)))
                .thenReturn(List.of(Map.of("kind", "discord", "value", "x", "label", "Discord", "recorded_at", Timestamp.from(exp))));

        var r = controller(jdbc).getSecurityOverview(new MockHttpServletRequest());
        assertEquals(200, r.getStatusCode().value());
        var body = (Map<?, ?>) r.getBody();
        assertEquals(Boolean.TRUE, body.get("available"));
        assertEquals(List.of("superadmin"), body.get("roles"));
        assertEquals(Map.of("state", "open", "expiresAt", exp.toString(), "idleExpiresAt", idle.toString()), body.get("consoleSession"));
        var re = (Map<?, ?>) body.get("reauthentication");
        assertEquals(reauth.toString(), re.get("at"));
        assertEquals(reauth.plusSeconds(300).toString(), re.get("freshUntil"));
        assertEquals(Boolean.TRUE, re.get("fresh"));
        assertEquals(1, ((List<?>) body.get("loginPolicy")).size());
        assertFalse(String.valueOf(body).contains("openedAt"));
    }

    // admin_login_policy requires superadmin; an operator must still get the console status.
    @Test void operatorGetsStatusWithoutTheSuperadminOnlyPolicy() {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        when(jdbc.queryForList(contains("FROM auth_sessions"), any(Object[].class)))
                .thenReturn(List.of(Map.of("id", session)));
        when(jdbc.queryForList(contains("admin_session_touch"), any(Object[].class)))
                .thenReturn(List.of(Map.of("state", "open")));
        var r = controller(jdbc, List.of("operator")).getSecurityOverview(new MockHttpServletRequest());
        assertEquals(200, r.getStatusCode().value());
        assertEquals(List.of(), ((Map<?, ?>) r.getBody()).get("loginPolicy"));
        verify(jdbc, never()).queryForList(contains("admin_login_policy"), any(Object[].class));
    }

    @Test void unreadableConsoleSessionIsNotInvented() {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        when(jdbc.queryForList(contains("FROM auth_sessions"), any(Object[].class))).thenReturn(List.of());
        var r = controller(jdbc).getSecurityOverview(new MockHttpServletRequest());
        assertEquals(503, r.getStatusCode().value());
        assertEquals("ADMIN_CONSOLE_STATUS_UNAVAILABLE", ((Map<?, ?>) r.getBody()).get("code"));
    }
}
