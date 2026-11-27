package com.moneyverse.api.config;

import com.moneyverse.api.domain.admin.service.AdminAuthService;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataAccessResourceFailureException;
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
 * Independent TOTP candidate (spec 2026-11-27-admin-totp-candidate-design): scoped high-risk
 * administrator writes need a proof bound to this session and the route's scope whenever the
 * actor is enforced. Placed after the existing role, CSRF and step-up checks, which are unchanged.
 */
class AdminTotpBoundaryTest {
    private final AdminAuthService auth = mock(AdminAuthService.class);
    private final AdminApiBoundaryFilter filter = new AdminApiBoundaryFilter(auth);

    private MockHttpServletResponse run(String method, String uri, boolean stepUp, boolean enforced, boolean proof) throws Exception {
        when(auth.resolveVerifiedAdminActor(any())).thenReturn(Optional.of(UUID.randomUUID()));
        when(auth.hasVerifiedSessionCsrf(any())).thenReturn(true);
        when(auth.hasRecentSessionReauthentication(any(), anyInt())).thenReturn(stepUp);
        when(auth.secondFactorEnforced(any())).thenReturn(enforced);
        when(auth.hasSecondFactorProof(any(), anyString())).thenReturn(proof);
        var res = new MockHttpServletResponse();
        var chain = new MockFilterChain();
        filter.doFilter(new MockHttpServletRequest(method, uri), res, chain);
        if (res.getStatus() == 200) assertNotNull(chain.getRequest());
        else assertNull(chain.getRequest());
        return res;
    }

    @Test void scopedWriteWithoutProofIsRefusedWhenEnforced() throws Exception {
        var res = run("POST", "/api/v1/admin/treasury/mint-topup", true, true, false);
        assertEquals(401, res.getStatus());
        assertTrue(res.getContentAsString().contains("\"second_factor_required\""));
        assertTrue(res.getContentAsString().contains("\"scope\":\"economy.treasury\""));
        verify(auth).hasSecondFactorProof(any(), eq("economy.treasury"));
    }

    @Test void scopedWriteWithProofPasses() throws Exception {
        assertEquals(200, run("POST", "/api/admin/backups/trigger", true, true, true).getStatus());
        verify(auth).hasSecondFactorProof(any(), eq("backup.restore"));
    }

    @Test void notEnrolledAndSwitchOffKeepsTodayBehaviour() throws Exception {
        assertEquals(200, run("POST", "/api/v1/admin/treasury/mint-topup", true, false, false).getStatus());
        verify(auth, never()).hasSecondFactorProof(any(), anyString());
    }

    @Test void unscopedWriteNeverQueriesTheFactor() throws Exception {
        assertEquals(200, run("POST", "/api/v1/admin/shop/items", true, true, false).getStatus());
        verify(auth, never()).secondFactorEnforced(any());
        verify(auth, never()).hasSecondFactorProof(any(), anyString());
    }

    @Test void readsNeverCheckTheFactor() throws Exception {
        assertEquals(200, run("GET", "/api/v1/admin/treasury/status", false, true, false).getStatus());
        verify(auth, never()).secondFactorEnforced(any());
    }

    @Test void enforcedButUnverifiableIsRefused() throws Exception {
        // The proof lookup answers false when the key or database is unavailable; that is a refusal.
        assertEquals(401, run("POST", "/api/v1/admin/security/abuse/suspend-permanent", true, true, false).getStatus());
    }

    @Test void stepUpIsStillCheckedFirst() throws Exception {
        var res = run("POST", "/api/v1/admin/treasury/mint-topup", false, true, true);
        assertEquals(401, res.getStatus());
        assertTrue(res.getContentAsString().contains("\"reauthentication_required\""));
        verify(auth, never()).secondFactorEnforced(any());
    }

    @Test void theFactorEndpointsThemselvesAreNotGatedByTheFactor() throws Exception {
        assertEquals(200, run("POST", "/api/v1/admin/security/totp/verify", true, true, false).getStatus());
        verify(auth, never()).hasSecondFactorProof(any(), anyString());
    }

    // AdminAuthService lookups fail closed.

    private static MockHttpServletRequest withSession() {
        var request = new MockHttpServletRequest("POST", "/api/v1/admin/treasury/mint-topup");
        request.setCookies(new Cookie("__Host-mv_session", "synthetic-session-token"));
        return request;
    }

    @Test void enforcementLookupFailureCountsAsEnforced() {
        // Every database call throws, so a null answer cannot make this pass by accident.
        var jdbc = mock(JdbcTemplate.class, invocation -> { throw new DataAccessResourceFailureException("down"); });
        var service = spy(new AdminAuthService(jdbc));
        doReturn(Optional.of(UUID.randomUUID())).when(service).resolveVerifiedAdminActor(any());
        assertTrue(service.secondFactorEnforced(withSession()));
    }

    @Test void proofLookupFailureCountsAsNoProof() {
        // Every database call throws, so a null answer cannot make this pass by accident.
        var jdbc = mock(JdbcTemplate.class, invocation -> { throw new DataAccessResourceFailureException("down"); });
        var service = spy(new AdminAuthService(jdbc));
        doReturn(Optional.of(UUID.randomUUID())).when(service).resolveVerifiedAdminActor(any());
        assertFalse(service.hasSecondFactorProof(withSession(), "economy.treasury"));
    }

    @Test void anUnreadableRequirementRowCountsAsEnforced() {
        var jdbc = mock(JdbcTemplate.class); // answers null for the requirement query
        var service = spy(new AdminAuthService(jdbc));
        doReturn(Optional.of(UUID.randomUUID())).when(service).resolveVerifiedAdminActor(any());
        assertTrue(service.secondFactorEnforced(withSession()));
    }

    @Test void noVerifiedActorMeansEnforcedAndNoProof() {
        var service = spy(new AdminAuthService(mock(JdbcTemplate.class)));
        doReturn(Optional.empty()).when(service).resolveVerifiedAdminActor(any());
        assertTrue(service.secondFactorEnforced(withSession()));
        assertFalse(service.hasSecondFactorProof(withSession(), "economy.treasury"));
    }
}
