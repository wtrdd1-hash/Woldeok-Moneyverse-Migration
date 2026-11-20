package com.moneyverse.api.config;

import com.moneyverse.api.domain.admin.service.AdminAuthService;
import com.moneyverse.api.domain.identity.service.UserAuthService;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/** Security gate contract: a request header or fixed actor can never grant identity. */
class SensitiveApiBoundaryFilterTest {
    private final UserAuthService identity = mock(UserAuthService.class);
    private final AdminAuthService admin = mock(AdminAuthService.class);
    private final SensitiveApiBoundaryFilter filter = new SensitiveApiBoundaryFilter(identity, admin);

    private UserAuthService.SessionInfo session(UUID actor) {
        var result = new UserAuthService.SessionInfo();
        result.setUserId(actor);
        result.setCsrfHash(UserAuthService.sha256("valid-csrf"));
        return result;
    }

    @Test void noSessionCannotReadOtherMembersSupportChatWalletBondsOrSeoLogs() throws Exception {
        for (String path : new String[]{
                "/api/v1/support/threads", "/api/support/threads", "/api/v1/chat/conversations",
                "/api/chat/conversations", "/api/wallet/overview", "/api/wallet/balance",
                "/api/v1/wallet/overview", "/api/v1/wallet/balance", "/api/wallet", "/api/v1/wallet",
                "/api/bonds/my-holdings", "/api/v1/seo/status/admin", "/seo/status", "/api/v1/audit/frontend-errors"}) {
            var req = new MockHttpServletRequest("GET", path);
            req.addHeader("X-User-Id", UUID.randomUUID().toString());
            var res = new MockHttpServletResponse();
            var chain = new MockFilterChain();
            filter.doFilter(req, res, chain);
            assertEquals(401, res.getStatus(), path);
            assertNull(chain.getRequest(), path);
            assertEquals("no-store", res.getHeader("Cache-Control"));
        }
    }

    @Test void verifiedSessionRejectsForgedActorHeaders() throws Exception {
        UUID actor = UUID.randomUUID();
        when(identity.resolveSession(any())).thenReturn(Optional.of(session(actor)));
        var req = new MockHttpServletRequest("GET", "/api/v1/support/threads");
        req.addHeader("X-User-Id", UUID.randomUUID().toString());
        var res = new MockHttpServletResponse();
        var chain = new MockFilterChain();
        filter.doFilter(req, res, chain);
        assertEquals(403, res.getStatus());
        assertNull(chain.getRequest());
    }

    @Test void verifiedSessionInjectsActualActorIntoOldHeaderBasedControllers() throws Exception {
        UUID actor = UUID.randomUUID();
        when(identity.resolveSession(any())).thenReturn(Optional.of(session(actor)));
        var req = new MockHttpServletRequest("GET", "/api/v1/support/threads");
        var res = new MockHttpServletResponse();
        var chain = new MockFilterChain();
        filter.doFilter(req, res, chain);
        assertNotNull(chain.getRequest());
        assertEquals(actor.toString(), ((jakarta.servlet.http.HttpServletRequest)chain.getRequest()).getHeader("X-User-Id"));
        assertEquals(actor.toString(), ((jakarta.servlet.http.HttpServletRequest)chain.getRequest()).getHeader("x-actor-user-id"));
    }

    @Test void memberStateChangeRequiresCsrfAndDoesNotAllowWalletTransferEvenWithCsrf() throws Exception {
        UUID actor = UUID.randomUUID();
        when(identity.resolveSession(any())).thenReturn(Optional.of(session(actor)));
        var req = new MockHttpServletRequest("POST", "/api/v1/support/threads");
        var res = new MockHttpServletResponse();
        var chain = new MockFilterChain();
        filter.doFilter(req, res, chain);
        assertEquals(403, res.getStatus());
        assertNull(chain.getRequest());

        req = new MockHttpServletRequest("POST", "/api/wallet/transfer");
        req.addHeader("X-CSRF-Token", "valid-csrf");
        res = new MockHttpServletResponse();
        chain = new MockFilterChain();
        filter.doFilter(req, res, chain);
        assertEquals(503, res.getStatus());
        assertNull(chain.getRequest());
    }

    @Test void adminSeoDiagnosticsRequiresDatabaseVerifiedAdminNotJustAnInternalHeader() throws Exception {
        var req = new MockHttpServletRequest("GET", "/api/v1/seo/status/admin");
        req.addHeader("x-internal-token", "random-untrusted-header");
        var res = new MockHttpServletResponse();
        var chain = new MockFilterChain();
        filter.doFilter(req, res, chain);
        assertEquals(401, res.getStatus());
        assertNull(chain.getRequest());

        when(admin.resolveVerifiedAdminActor(any())).thenReturn(Optional.of(UUID.randomUUID()));
        res = new MockHttpServletResponse();
        chain = new MockFilterChain();
        filter.doFilter(req, res, chain);
        assertNotNull(chain.getRequest());
    }

    @Test void privateGrowthSpaceAndAdvisorPathsMustNotTrustHeaderIds() throws Exception {
        for (String path : new String[] {
                "/api/space/my", "/api/v1/space/my", "/api/spaces/my",
                "/api/v1/spaces/my", "/api/v1/progression", "/api/progression/credits",
                "/api/v1/progression/status", "/api/v1/advisor/diagnose",
                "/api/advisor/deoki/diagnose", "/api/v1/advisor/deoki/ask"}) {
            var req = new MockHttpServletRequest("GET", path);
            req.addHeader("X-User-Id", UUID.randomUUID().toString());
            var res = new MockHttpServletResponse();
            var chain = new MockFilterChain();
            filter.doFilter(req, res, chain);
            assertEquals(401, res.getStatus(), path);
            assertNull(chain.getRequest(), path);
        }
    }

    @Test void verifiedMemberCannotUseUnverifiedSpaceTaxOrAdvisorFinance() throws Exception {
        when(identity.resolveSession(any())).thenReturn(Optional.of(session(UUID.randomUUID())));
        for (String path : new String[] {
                "/api/v1/space/purchase", "/api/v1/space/bogus/tax",
                "/api/v1/progression/refreshes", "/api/v1/advisor/ask"}) {
            var req = new MockHttpServletRequest("POST", path);
            req.addHeader("X-CSRF-Token", "valid-csrf");
            var res = new MockHttpServletResponse();
            var chain = new MockFilterChain();
            filter.doFilter(req, res, chain);
            assertEquals(503, res.getStatus(), path);
            assertNull(chain.getRequest(), path);
        }
    }

    @Test void browserCorsPreflightKeepsExistingOriginPolicy() throws Exception {
        var req = new MockHttpServletRequest("OPTIONS", "/api/v1/support/threads");
        req.addHeader("Origin", "https://easy-scraping.com");
        req.addHeader("Access-Control-Request-Method", "GET");
        var res = new MockHttpServletResponse();
        var chain = new MockFilterChain();
        filter.doFilter(req, res, chain);
        assertNotNull(chain.getRequest());
    }
}
