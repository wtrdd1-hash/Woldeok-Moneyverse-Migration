package com.moneyverse.api.domain.identity;

import com.moneyverse.api.domain.identity.service.UserAuthService;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletResponse;

import java.lang.reflect.Constructor;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Security review 2026-11-25: the legacy mv_session cookie was issued without
 * SameSite, so browsers that do not default to Lax sent it on cross-site POSTs,
 * and resolveSession falls back to it. Every session cookie must be SameSite=Lax.
 */
class SessionCookieSameSiteTest {
    @Test void everySessionCookieIsSameSiteLax() throws Exception {
        UserAuthService auth = mockitoFree();
        MockHttpServletResponse response = new MockHttpServletResponse();
        auth.setSessionCookie(response, "token-value");
        var cookies = response.getHeaders("Set-Cookie");
        assertFalse(cookies.isEmpty());
        for (String c : cookies) {
            if (c.contains("mv_session=")) assertTrue(c.contains("SameSite=Lax"), c);
        }
        assertTrue(cookies.stream().anyMatch(c -> c.startsWith("mv_session=")), "legacy cookie still issued for existing clients");
    }

    private static UserAuthService mockitoFree() {
        return org.mockito.Mockito.mock(UserAuthService.class, org.mockito.Mockito.CALLS_REAL_METHODS);
    }
}
