package com.moneyverse.api.domain.tools;

import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;

import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.*;

class SpringSharedSupportDockV38Test {
    private static String text(String path) throws Exception {
        try (var input = new ClassPathResource(path).getInputStream()) {
            return new String(input.readAllBytes(), StandardCharsets.UTF_8);
        }
    }

    @Test void nativeSpringLayoutUsesOneAccessibleNoJavascriptHelpDock() throws Exception {
        String layout=text("templates/mv28/layout.html");
        assertTrue(layout.contains("mv-support-dock"));
        assertTrue(layout.contains("<details"));
        assertTrue(layout.contains("<summary"));
        assertTrue(layout.contains("href=\"/support\""));
        assertFalse(layout.contains("fetch("));
        assertFalse(layout.contains("_next/"));
    }

    @Test void mobileStylesUse56PxTouchTargetAndSafeArea() throws Exception {
        String css=text("static/mv-spring/v38/shared-ui.css");
        assertTrue(css.contains("56px"));
        assertTrue(css.contains("safe-area-inset-bottom"));
        assertTrue(css.contains("@media"));
        assertTrue(css.contains("focus-visible"));
        assertTrue(css.contains("prefers-reduced-motion"));
        assertTrue(css.contains("320px"));
    }

    @Test void everyThymeleafPageWithFooterLoadsTheSharedStyle() throws Exception {
        for (String template : new String[]{"templates/mv29/status.html","templates/mv30/hub.html"}) {
            String body=text(template);
            assertTrue(body.contains("href=\"/mv-spring/v38/shared-ui.css\""), template);
            assertTrue(body.contains("mv28/layout :: footer"), template);
        }
        for (String template : new String[]{"templates/mv28/compound.html","templates/mv28/stock.html"}) {
            String body=text(template);
            assertTrue(body.contains("mv28/layout :: head"), template);
        }
    }

    @Test void explicitWarningProhibitsUnverifiedChatSend() throws Exception {
        String layout=text("templates/mv28/layout.html");
        assertTrue(layout.contains("pending security verification"));
        assertTrue(layout.contains("보안 확인 전"));
    }
}
