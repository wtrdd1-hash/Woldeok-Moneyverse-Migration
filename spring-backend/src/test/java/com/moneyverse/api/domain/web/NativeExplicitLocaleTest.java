package com.moneyverse.api.domain.web;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.mock.web.MockHttpServletRequest;
import static org.junit.jupiter.api.Assertions.*;

class NativeExplicitLocaleTest {
 @ParameterizedTest @ValueSource(strings={"en","ko","ja","zh","vi"})
 void explicitRequestWinsForEveryNativeResolver(String lang) {
  var locale=new UiLocale(new ObjectMapper());
  var r=new MockHttpServletRequest("GET","/");
  r.setParameter("lang",lang.toUpperCase(java.util.Locale.ROOT));
  r.setCookies(new Cookie("wdmv_locale",lang.equals("en")?"ko":"en"));
  r.addHeader("Accept-Language","vi");
  assertEquals(lang,locale.resolve(r));
  assertEquals(lang,locale.resolvePublic(r));
  assertEquals(lang,locale.resolveLocale(r).getLanguage());
 }
 @org.junit.jupiter.api.Test void unsupportedSelectionRetainsTheManualFallback() {
  var locale=new UiLocale(new ObjectMapper());var r=new MockHttpServletRequest();
  r.setParameter("lang","unsupported");r.setCookies(new Cookie("wdmv_locale","ja"));
  assertEquals("ja",locale.resolve(r));assertEquals("ja",locale.resolvePublic(r));
 }
}
