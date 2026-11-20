package com.moneyverse.api.domain.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.mock.web.MockHttpServletRequest;

import static org.junit.jupiter.api.Assertions.assertEquals;

class UiLocaleMessagingRouteTest {
    private final UiLocale resolver = new UiLocale(new ObjectMapper());

    @ParameterizedTest
    @ValueSource(strings = {"/support", "/support/", "/support.html", "/support/index.html",
                            "/chat", "/chat/", "/chat.html", "/chat/index.html"})
    void messagingAliasesHonorExplicitPreferenceCookie(String path) {
        var request = new MockHttpServletRequest("GET", path);
        request.setCookies(new Cookie("wdmv_locale", "ko"));
        request.addHeader("Accept-Language", "ja");
        assertEquals("ko", resolver.resolveLocale(request).getLanguage(), path);
    }
}
