package com.moneyverse.api.domain.tools;

import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;

import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.*;

class SpringFiveLocaleResourcesV39Test {
    private static String read(String path) throws Exception {
        try (var stream = new ClassPathResource(path).getInputStream()) {
            return new String(stream.readAllBytes(), StandardCharsets.UTF_8);
        }
    }

    @Test void nativeThymeleafHeadersAlwaysLoadFiveLanguagePicker() throws Exception {
        String shared = read("templates/mv28/layout.html");
        String hub = read("templates/mv30/hub.html");
        String status = read("templates/mv29/status.html");
        for (String page : new String[]{shared,hub,status}) {
            assertTrue(page.contains("/mv-spring/v39/language-picker.css"));
            assertTrue(page.contains("type=\"module\""));
            assertTrue(page.contains("/mv-spring/v39/language-picker.mjs"));
        }
        assertTrue(shared.contains("data-mv-language-slot"));
        assertTrue(shared.contains("data-mv-auto"));
        for (String lang : new String[]{"en","ko","ja","zh","vi"}) {
            assertTrue(shared.contains("data-lang=\"" + lang + "\""), lang);
        }
    }

    @Test void responsivePickerNeeds44pxControlsAndSmallMobileViewportRules() throws Exception {
        String css = read("static/mv-spring/v39/language-picker.css");
        assertTrue(css.contains("44px"));
        assertTrue(css.contains("max-width:390px"));
        assertTrue(css.contains("top: calc(65px + env(safe-area-inset-top))"),
            "on compact mobile the menu must open above the page rather than cover the fixed help dock");
        assertTrue(css.contains("bottom: auto"), "do not overlap the 96px-bottom help launcher");
        assertTrue(css.contains("safe-area-inset-bottom"));
        assertTrue(css.contains("focus-visible"));
        assertTrue(css.contains("prefers-reduced-motion"));
    }

    @Test void pickerSharesPreferenceWithResponsiveMemberPages() throws Exception {
        String picker = read("static/mv-spring/v39/language-picker.mjs");
        assertTrue(picker.contains("wdmv_locale_preference"),
            "member Spring pages use this localStorage key; mismatched keys lose manual choices");
        assertTrue(picker.contains("localStorage"), "preserve manual preference between member and native pages");
        assertTrue(picker.contains("wdmv_locale"), "preserve current user-visible cookie contract");
        assertTrue(picker.contains("auto"), "auto reset must propagate across every screen");
    }

    @Test void pickerIsStrictlyPresentationNotFinancialMutation() throws Exception {
        String script = read("static/mv-spring/v39/language-picker.mjs");
        assertTrue(script.contains("wdmv_locale"));
        assertTrue(script.contains("detectBrowserLocale"));
        assertFalse(script.contains("fetch("));
        assertFalse(script.contains("XMLHttpRequest"));
        assertFalse(script.contains("X-User-Id"));
        assertFalse(script.contains("innerHTML"));
    }
}
