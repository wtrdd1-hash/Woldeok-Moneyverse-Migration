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

class Nov18VisualChromeTest {
    @org.junit.jupiter.api.Test
    void brandedImageUsesTheCurrentPublicFaviconBytes() throws Exception {
        try(var current=getClass().getResourceAsStream("/static/favicon.ico");
                var brand=getClass().getResourceAsStream("/static/assets/mv39/favicon.ico")) {
            assertNotNull(current);assertNotNull(brand);
            assertArrayEquals(current.readAllBytes(),brand.readAllBytes(),
                "Navigation must use the current public favicon rather than an older export");
        }
    }

    @ParameterizedTest
    @ValueSource(strings={"en","ko","ja","zh","vi"})
    void administratorHeaderRetainsTheRealBrandWhenBothSidebarsAreClosed(String language) {
        var resolver=new ClassLoaderTemplateResolver();
        resolver.setPrefix("templates/");resolver.setSuffix(".html");resolver.setTemplateMode("HTML");
        var engine=new SpringTemplateEngine();engine.setTemplateResolver(resolver);
        var pages=new UiPageRenderer(engine,new UiLocale(new ObjectMapper()));
        var request=new MockHttpServletRequest();request.addHeader("Accept-Language",language);
        String html=pages.render("mv43/admin-unavailable",request,Map.of("denied",true,"adminPageKey","dashboard"));
        var header=Pattern.compile("<header[^>]*class=\"admin-topbar\"[^>]*>([\\s\\S]*?)</header>").matcher(html);
        assertTrue(header.find(),"The administrator header must be rendered");
        assertTrue(Pattern.compile("<img[^>]+src=\"/assets/mv39/favicon\\.ico[^\"]*\"").matcher(header.group(1)).find(),
            "The visible header must own a real favicon image independently of closed navigation");
    }
}
