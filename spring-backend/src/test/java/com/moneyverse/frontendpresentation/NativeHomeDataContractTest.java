package com.moneyverse.frontendpresentation;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneyverse.api.domain.web.UiLocale;
import com.moneyverse.api.domain.web.UiPageRenderer;
import java.util.Map;
import java.util.regex.Pattern;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.mock.web.MockHttpServletRequest;
import org.thymeleaf.spring6.SpringTemplateEngine;
import org.thymeleaf.templateresolver.ClassLoaderTemplateResolver;
import static org.junit.jupiter.api.Assertions.*;

/** Live operational claims require a source; a rotating script is not telemetry. */
class NativeHomeDataContractTest {
    @ParameterizedTest
    @ValueSource(strings={"en","ko","ja","zh","vi"})
    void renderedHomeDoesNotInventFinancialOrOperationalHealth(String language) {
        var resolver=new ClassLoaderTemplateResolver();
        resolver.setPrefix("templates/");resolver.setSuffix(".html");resolver.setTemplateMode("HTML");resolver.setCharacterEncoding("UTF-8");
        var engine=new SpringTemplateEngine();engine.setTemplateResolver(resolver);
        var pages=new UiPageRenderer(engine,new UiLocale(new ObjectMapper()));
        var request=new MockHttpServletRequest();request.addHeader("Accept-Language",language);
        String html=pages.render("mv43/home",request,Map.of("uiPageKey","home"));
        assertFalse(Pattern.compile("(?is)0 latency|\\+0\\.48% yield|health 100% OK|cryptographic signature verified for user session").matcher(html).find(),
            "The member home must not certify invented financial or operational results");
        assertFalse(Pattern.compile("(?is)<script(?![^>]*\\bsrc=)[^>]*>").matcher(html).find(),
            "The home must honor its self-only script CSP instead of simulating live data inline");
        assertTrue(html.contains("id=\"page-content\""),"The verified backend consumer must remain available");
        assertTrue(html.contains("/assets/mv39/favicon.ico"),"The current official favicon must remain the navigation brand");
    }
}
