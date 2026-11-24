package com.moneyverse.frontendpresentation;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.moneyverse.api.domain.web.UiLocale;
import com.moneyverse.api.domain.web.UiPageRenderer;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.Map;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.mock.web.MockHttpServletRequest;
import org.thymeleaf.spring6.SpringTemplateEngine;
import org.thymeleaf.templateresolver.ClassLoaderTemplateResolver;
import static org.junit.jupiter.api.Assertions.*;

class GameWorldBrandContractTest {
    private byte[] asset(String path) throws Exception {
        try (var in=getClass().getResourceAsStream(path)) {
            assertNotNull(in,path); return in.readAllBytes();
        }
    }
    @ParameterizedTest
    @ValueSource(strings={"en","ko","ja","zh","vi"})
    void realSharedRenderUsesVerifiedGameStyleAndFaviconInsteadOfLetterEmblems(String language) throws Exception {
        var resolver=new ClassLoaderTemplateResolver();
        resolver.setPrefix("templates/");resolver.setSuffix(".html");resolver.setTemplateMode("HTML");
        var engine=new SpringTemplateEngine();engine.setTemplateResolver(resolver);
        var pages=new UiPageRenderer(engine,new UiLocale(new ObjectMapper()));
        var request=new MockHttpServletRequest();request.addHeader("Accept-Language",language);
        var hash=HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(asset("/static/assets/mv43/game-world.css")));
        for(String template:new String[]{"mv43/home","mv43/admin-unavailable"}) {
            var html=pages.render(template,request,Map.of("uiPageKey","home","denied",true,"adminPageKey","dashboard"));
            assertTrue(html.contains("/assets/mv43/game-world.css?v="+hash),template);
            assertTrue(html.contains("/assets/mv39/favicon.ico?v="),template);
            var header=java.util.regex.Pattern.compile("<header[^>]*>[\\s\\S]*?</header>").matcher(html);
            assertTrue(header.find(),template);
            assertTrue(header.group().contains("id=\"mv-support-launcher\""),"Support must own a toolbar slot rather than cover form controls");
            assertEquals(1,java.util.regex.Pattern.compile("id=\"mv-support-launcher\"").matcher(html).results().count());
            assertFalse(html.contains("AI CORE ACTIVE"),template);
            assertFalse(html.contains("0.48%"),template);
        }
        assertArrayEquals(asset("/static/favicon.ico"),asset("/static/assets/mv39/favicon.ico"));
        var css=new String(asset("/static/assets/mv40/admin.css"),StandardCharsets.UTF_8);
        assertFalse(css.contains("content:'W'"),"Administrator decoration must not substitute a letter logo");
        assertTrue(css.contains("/assets/mv39/favicon.ico?v="),"Administrator decoration must use actual favicon bytes");
    }
}
