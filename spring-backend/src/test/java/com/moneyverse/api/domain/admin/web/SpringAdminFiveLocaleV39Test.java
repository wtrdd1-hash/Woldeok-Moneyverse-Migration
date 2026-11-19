package com.moneyverse.api.domain.admin.web;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class SpringAdminFiveLocaleV39Test {
    @Test void realSpringAdminHtmlExposesFiveLanguageResponsivePicker() {
        String html = LiveAdminUsersPage.renderPage(false, "Member directory", "<p>Actual data</p>");
        assertTrue(html.contains("data-mv-language-slot"), "real admin HTML has native accessible language slot");
        assertTrue(html.contains("/mv-spring/v39/language-picker.mjs"), "same-origin module loaded by Java");
        assertTrue(html.contains("/mv-spring/v39/language-picker.css"), "responsive CSS included by Java");
        assertTrue(html.contains("aria-label=\"Choose language\""), "JS-disabled fallback has an accessible label");
        for (String lang : new String[]{"en","ko","ja","zh","vi"}) {
            assertTrue(html.contains("data-lang=\"" + lang + "\""), lang);
        }
        assertTrue(html.contains("data-mv-auto"), "automatic detection must be selectable");
        assertTrue(html.contains("Actual data"), "previous server data must not be replaced");
    }

    @Test void adminLangSwitcherDoesNotExposeTokensOrAlterFinancialData() {
        String html = LiveAdminUsersPage.renderPage(false, "Source status", "<p id=\"ledger-status\">UNKNOWN</p>");
        assertTrue(html.contains("id=\"ledger-status\""));
        assertTrue(html.contains("UNKNOWN"));
        assertFalse(html.contains("X-User-Id"));
        assertFalse(html.contains("INTERNAL_API_TOKEN"));
    }
}
