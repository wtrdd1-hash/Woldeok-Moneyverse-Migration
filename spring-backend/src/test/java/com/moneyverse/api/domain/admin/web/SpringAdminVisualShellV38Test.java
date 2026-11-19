package com.moneyverse.api.domain.admin.web;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class SpringAdminVisualShellV38Test {
    @Test void adminShellHasNativeDesignAndAccessibleSafeSupportDockInEnglish() {
        String html=LiveAdminUsersPage.renderPage(false,"Member directory","<section class=\"panel\"><h1>Real records</h1></section>");
        assertTrue(html.contains("data-spring-admin-ui=\"v2026.11.19.38.1\""), "server output must expose build identity");
        assertTrue(html.contains("/mv-spring/v38/admin-ui.css"), "shared style delivered by Spring, no Next dependency");
        assertTrue(html.contains("ADMIN CONTROL CENTER"));
        assertTrue(html.contains("aria-label=\"Admin navigation\""));
        assertTrue(html.contains("<details class=\"mv-support-dock\""), "single details-based help dock");
        assertTrue(html.contains("href=\"/admin/support\""));
        assertTrue(html.contains("Message sending is unavailable"), "no fake chat delivery");
        assertFalse(html.contains("fetch("));
        assertTrue(html.contains("Real records"));
    }

    @Test void koreanShellMaintainsLabelsAndEscapesDynamicTitle() {
        String html=LiveAdminUsersPage.renderPage(true, "<script>alert('bad')</script>", "verified content");
        assertTrue(html.contains("lang=\"ko\""));
        assertTrue(html.contains("관리자 관제 센터"));
        assertTrue(html.contains("문의 메시지 전송은"));
        assertFalse(html.contains("<script>alert('bad')</script>"));
        assertTrue(html.contains("&lt;script&gt;"));
        assertTrue(html.contains("verified content"));
    }

    @Test void desktopMatchesSidebarReferenceAndMobileReflowsWithoutScript() throws Exception {
        var resource = new org.springframework.core.io.ClassPathResource("static/mv-spring/v38/admin-ui.css");
        String css;
        try (var input = resource.getInputStream()) {
            css = new String(input.readAllBytes(), java.nio.charset.StandardCharsets.UTF_8);
        }
        assertTrue(css.contains("grid-template-columns:240px minmax(0,1fr)"));
        assertTrue(css.contains("@media (max-width:980px)"));
        assertTrue(css.contains("overflow-x:auto"));
        String html = LiveAdminUsersPage.renderPage(false, "Admin", "<p>real status only</p>");
        assertTrue(html.contains("mv-admin-page-head"));
        assertTrue(html.contains("mv-admin-nav-links"));
    }

    @Test void onlyOneSupportDockAndNoRuntimeDependencies() {
        String html=LiveAdminUsersPage.renderPage(false, "Dashboard", "<p>Canonical data only</p>");
        assertEquals(1, count(html,"class=\"mv-support-dock\""));
        assertFalse(html.contains("_next/"));
        assertFalse(html.contains("react"));
        assertFalse(html.contains("localStorage"));
    }

    private static int count(String text,String needle) {
        int total=0, index=0;
        while((index=text.indexOf(needle,index))!=-1) {total++; index+=needle.length();}
        return total;
    }
}
