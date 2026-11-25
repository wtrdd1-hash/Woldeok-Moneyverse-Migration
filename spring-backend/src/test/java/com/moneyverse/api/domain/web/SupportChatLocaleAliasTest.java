package com.moneyverse.api.domain.web;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.mock.web.MockHttpServletRequest;
import static org.junit.jupiter.api.Assertions.assertEquals;

class SupportChatLocaleAliasTest {
 @ParameterizedTest
 @ValueSource(strings={"/support", "/support/", "/support.html", "/support/index.html", "/chat", "/chat/", "/chat.html", "/chat/index.html"})
 void explicitLanguageWinsForSupportAndChatAliases(String path) {
  var locale = new UiLocale(new ObjectMapper());
  var request = new MockHttpServletRequest("GET", path);
  request.setParameter("lang", "ja");
  request.setCookies(new Cookie("wdmv_locale", "ko"));
  request.addHeader("Accept-Language", "vi");
  assertEquals("ja", locale.resolveLocale(request).getLanguage(), path);
 }
}
