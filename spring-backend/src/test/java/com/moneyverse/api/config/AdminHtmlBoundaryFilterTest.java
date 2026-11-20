package com.moneyverse.api.config;

import com.moneyverse.api.domain.admin.service.AdminAuthService;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.util.Optional;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AdminHtmlBoundaryFilterTest {
    private final AdminAuthService auth = mock(AdminAuthService.class);
    private final AdminHtmlBoundaryFilter guard = new AdminHtmlBoundaryFilter(auth);

    @Test void everySensitiveHtmlAliasRedirectsBeforeStaticAssetsCanLeak() throws Exception {
        for (String path : new String[]{"/admin", "/admin/", "/admin.html", "/admin/index.html",
                "/admin/analytics", "/admin/analytics.html", "/admin/users", "/admin/market",
                "/admin/seo-audit", "/admin/treasury/grants", "/admin-preview", "/admin-preview/index.html", "/ADMIN", "/%61dmin", "/admin%2Fanalytics"}) {
            MockHttpServletRequest req = new MockHttpServletRequest("GET", path);
            MockHttpServletResponse resp = new MockHttpServletResponse();
            MockFilterChain chain = new MockFilterChain();
            guard.doFilter(req, resp, chain);
            assertEquals(302, resp.getStatus(), path);
            assertNull(chain.getRequest(), path);
            assertTrue(resp.getHeader("Location").startsWith("/login?next="), path);
            assertTrue(resp.getHeader("Cache-Control").contains("no-store"), path);
            assertTrue(resp.getHeader("X-Robots-Tag").contains("noindex"), path);
        }
    }

    @Test void validSessionAndDbRoleMayReadButPrivateHeadersAlwaysApply() throws Exception {
        when(auth.resolveVerifiedAdminActor(any())).thenReturn(Optional.of(UUID.randomUUID()));
        MockHttpServletResponse resp = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();
        guard.doFilter(new MockHttpServletRequest("GET", "/admin/market"), resp, chain);
        assertNotNull(chain.getRequest());
        assertEquals("private, no-store", resp.getHeader("Cache-Control"));
        assertEquals("DENY", resp.getHeader("X-Frame-Options"));
    }

    @Test void publicMemberPagesAndAdminApisPassToTheirIndependentOwners() throws Exception {
        for(String path:new String[]{"/", "/wallet", "/api/v1/admin/users", "/admin/backups/status", "/admin/shop/items", "/admin/operations/tasks", "/assets/mv39/site.css", "/administer"}) {
            MockFilterChain chain=new MockFilterChain();
            MockHttpServletResponse resp=new MockHttpServletResponse();
            guard.doFilter(new MockHttpServletRequest("GET",path),resp,chain);
            assertNotNull(chain.getRequest(),path);
        }
        verifyNoInteractions(auth);
    }

    @Test void identityHeadersAndUnknownBearerNeverMakeAnAdmin() throws Exception {
        MockHttpServletRequest req=new MockHttpServletRequest("GET","/admin");
        req.addHeader("X-User-Id",UUID.randomUUID().toString());
        req.addHeader("x-internal-token","spoof");
        req.addHeader("Authorization","Bearer spoof");
        MockHttpServletResponse resp=new MockHttpServletResponse();
        guard.doFilter(req,resp,new MockFilterChain());
        assertEquals(302,resp.getStatus());
        verify(auth).resolveVerifiedAdminActor(req);
    }
}
