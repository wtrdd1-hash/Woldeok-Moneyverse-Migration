package com.moneyverse.api.domain.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import static org.junit.jupiter.api.Assertions.assertEquals;

class UiLocaleExplicitLanguagePriorityTest {
    private final UiLocale locale = new UiLocale(new ObjectMapper());

    @Test
    void explicitQueryLanguageOverridesPersistedCookieOnPublicRoute() {
        var request = new MockHttpServletRequest("GET", "/tools");
        request.setParameter("lang", "JA");
        request.setCookies(new Cookie("wdmv_locale", "ko"));
        request.addHeader("Accept-Language", "vi");
        assertEquals("ja", locale.resolvePublic(request));
    }

    @Test
    void persistedManualChoiceWinsOverBrowserWithoutExplicitQuery() {
        var request = new MockHttpServletRequest("GET", "/tools");
        request.setCookies(new Cookie("wdmv_locale", "ko"));
        request.addHeader("Accept-Language", "ja");
        assertEquals("ko", locale.resolvePublic(request));
    }
}
