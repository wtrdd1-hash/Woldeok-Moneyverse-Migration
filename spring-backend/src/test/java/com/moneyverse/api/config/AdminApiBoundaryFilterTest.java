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

class AdminApiBoundaryFilterTest {
    private final AdminAuthService auth = mock(AdminAuthService.class);
    private final AdminApiBoundaryFilter filter = new AdminApiBoundaryFilter(auth);

    @Test void unverifiedInternalHeaderIsDeniedOnAllAdminApiPrefixes() throws Exception {
        for (String uri : new String[] {"/api/v1/admin/controls", "/api/admin/bank", "/api/v1/admin/users"}) {
            var req = new MockHttpServletRequest("GET", uri);
            req.addHeader("x-internal-token", "random-untrusted");
            var res = new MockHttpServletResponse();
            var chain = new MockFilterChain();
            filter.doFilter(req, res, chain);
            assertEquals(401, res.getStatus());
            assertNull(chain.getRequest());
        }
    }

    @Test void verifiedAdminCanRead() throws Exception {
        var req = new MockHttpServletRequest("GET", "/api/v1/admin/users");
        var res = new MockHttpServletResponse();
        var chain = new MockFilterChain();
        when(auth.resolveVerifiedAdminActor(any())).thenReturn(Optional.of(UUID.randomUUID()));
        filter.doFilter(req, res, chain);
        assertNotNull(chain.getRequest());
    }

    @Test void verifiedAdminCannotWriteWithoutMatchingCsrf() throws Exception {
        var req = new MockHttpServletRequest("PUT", "/api/v1/admin/controls/feature-switches/casino");
        var res = new MockHttpServletResponse();
        var chain = new MockFilterChain();
        when(auth.resolveVerifiedAdminActor(any())).thenReturn(Optional.of(UUID.randomUUID()));
        filter.doFilter(req, res, chain);
        assertEquals(403, res.getStatus());
        assertNull(chain.getRequest());
    }
}
