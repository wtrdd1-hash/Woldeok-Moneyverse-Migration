package com.moneyverse.api.config;

import com.moneyverse.api.domain.admin.service.AdminAuthService;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Owner decisions v2026.11.27.1457.1 / 1507.1: server-side step-up for administrator writes, using
 * the existing session-bound recent password re-verification (migration 031,
 * /api/v1/auth/local/reauthentication, 15-minute window, the NestJS ReauthGuard contract). This is
 * step-up re-authentication of the same factor, NOT an independent second factor; the independent
 * factor question (AGENTS.md section 5 vs the TOTP retirement in migration 197) is a separate,
 * recorded owner decision. Every administrator write except opening/closing the console needs it.
 */
class AdminStepUpBoundaryTest {
    private final AdminAuthService auth = mock(AdminAuthService.class);
    private final AdminApiBoundaryFilter filter = new AdminApiBoundaryFilter(auth);

    private MockHttpServletResponse run(String method, String uri, boolean recent) throws Exception {
        when(auth.resolveVerifiedAdminActor(any())).thenReturn(Optional.of(UUID.randomUUID()));
        when(auth.hasVerifiedSessionCsrf(any())).thenReturn(true);
        when(auth.hasRecentSessionReauthentication(any(), anyInt())).thenReturn(recent);
        var res = new MockHttpServletResponse();
        var chain = new MockFilterChain();
        filter.doFilter(new MockHttpServletRequest(method, uri), res, chain);
        if (res.getStatus() == 200) assertNotNull(chain.getRequest());
        else assertNull(chain.getRequest());
        return res;
    }

    @Test void aWriteWithoutRecentReauthenticationIsRefused() throws Exception {
        for (String method : new String[] {"POST", "PUT", "PATCH", "DELETE"}) {
            var res = run(method, "/api/v1/admin/users/" + UUID.randomUUID() + "/restriction", false);
            assertEquals(401, res.getStatus(), method);
            assertTrue(res.getContentAsString().contains("\"reauthentication_required\""));
        }
    }

    @Test void aWriteWithRecentReauthenticationPasses() throws Exception {
        assertEquals(200, run("PUT", "/api/v1/admin/controls/feature-switches/casino", true).getStatus());
        verify(auth).hasRecentSessionReauthentication(any(), eq(AdminAuthService.STEP_UP_WINDOW_SECONDS));
    }

    @Test void legacyAdminJsonWritesNeedItToo() throws Exception {
        assertEquals(401, run("POST", "/api/admin/treasury/swf/rebalance", false).getStatus());
    }

    @Test void readsDoNotNeedIt() throws Exception {
        assertEquals(200, run("GET", "/api/v1/admin/users", false).getStatus());
    }

    @Test void openingAndClosingTheConsoleIsTheOnlyExemption() throws Exception {
        assertEquals(200, run("POST", "/api/v1/admin/security/sessions", false).getStatus());
        assertEquals(200, run("DELETE", "/api/admin/security/sessions", false).getStatus());
        assertEquals(401, run("POST", "/api/v1/admin/security/forced-logouts", false).getStatus());
        assertEquals(401, run("POST", "/api/v1/admin/security/sessions/extra", false).getStatus());
    }

    @Test void csrfIsStillCheckedFirst() throws Exception {
        when(auth.resolveVerifiedAdminActor(any())).thenReturn(Optional.of(UUID.randomUUID()));
        when(auth.hasVerifiedSessionCsrf(any())).thenReturn(false);
        var res = new MockHttpServletResponse();
        filter.doFilter(new MockHttpServletRequest("POST", "/api/v1/admin/users/x/restriction"), res, new MockFilterChain());
        assertEquals(403, res.getStatus());
        verify(auth, never()).hasRecentSessionReauthentication(any(), anyInt());
    }

    @Test void theWindowMatchesThePasswordReauthenticationWindow() {
        assertEquals(900, AdminAuthService.STEP_UP_WINDOW_SECONDS);
    }

    /** The proof is the current session's own timestamp: bound to its token hash and its user. */
    @Test void theProofIsBoundToTheCurrentSessionAndUser() {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        AdminAuthService real = spy(new AdminAuthService(jdbc));
        UUID actor = UUID.randomUUID();
        doReturn(Optional.of(actor)).when(real).resolveVerifiedAdminActor(any());
        doReturn("raw-session").when(real).extractSessionToken(any());
        when(jdbc.queryForObject(anyString(), eq(Integer.class), any(), any(), any())).thenReturn(1);
        assertTrue(real.hasRecentSessionReauthentication(new MockHttpServletRequest(), 900));
        verify(jdbc).queryForObject(contains("token_hash = ?"), eq(Integer.class), eq(AdminAuthService.sha256("raw-session")), eq(actor), eq(900));
    }

    @Test void anUnreadableProofFailsClosed() {
        JdbcTemplate jdbc = mock(JdbcTemplate.class);
        AdminAuthService real = spy(new AdminAuthService(jdbc));
        doReturn(Optional.of(UUID.randomUUID())).when(real).resolveVerifiedAdminActor(any());
        doReturn("raw-session").when(real).extractSessionToken(any());
        when(jdbc.queryForObject(anyString(), eq(Integer.class), any(), any(), any())).thenThrow(new RuntimeException("down"));
        assertFalse(real.hasRecentSessionReauthentication(new MockHttpServletRequest(), 900));
        doReturn(null).when(real).extractSessionToken(any());
        assertFalse(real.hasRecentSessionReauthentication(new MockHttpServletRequest(), 900));
    }
}
