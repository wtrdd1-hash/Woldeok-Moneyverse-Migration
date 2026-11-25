package com.moneyverse.frontendpresentation;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

/** Protect the owner-approved single violet brand without conflating it with financial statuses. */
class Nov18VioletBrandContractTest {
    private static Path staticRoot() throws Exception {
        return Path.of(Nov18VioletBrandContractTest.class.getResource("/static/").toURI());
    }

    @Test
    void springBankHeroAndPromotionalCardsUseTheVioletBrandRatherThanCyanOrGreen() throws Exception {
        String page = Files.readString(staticRoot().resolve("bank.html"), StandardCharsets.UTF_8);
        assertTrue(page.contains("class=\"bank-brand-hero"), "Bank hero must own a semantic violet style");
        assertTrue(page.contains("bank-brand-headline"));
        assertTrue(page.contains("bank-brand-product-icon"));
        assertTrue(page.contains("bank-product-grid"), "Bank needs a responsive native grid without missing Next CSS");
        assertFalse(page.contains("/_next/static/css/8bbd23f36a44eb75.css"), "Do not request a missing legacy stylesheet");
        assertTrue(page.contains("bank-brand-rate"));
        assertFalse(page.contains("via-cyan-300"), "Bank brand headline must not be cyan/green");
        assertFalse(page.contains("from-blue-900/40"), "Bank brand hero must not be a blue-only theme");
        assertFalse(page.contains("bg-emerald-500/10"), "Promotional loan icon is not a verified green-success state");
        assertTrue(page.contains("href=\"/css/mv-theme-nov18.css\""));
        String theme = Files.readString(staticRoot().resolve("css/mv-theme-nov18.css"));
        assertTrue(theme.contains(".bank-brand-hero"));
        assertTrue(theme.contains(".bank-brand-product-icon"));
        assertTrue(theme.contains(".bank-brand-headline"));
        assertTrue(theme.contains("grid-template-columns: repeat(4, minmax(0, 1fr))"), "Desktop bank layout needs 4 product columns");
        assertTrue(theme.contains("/fonts/material-symbols-outlined.woff2"), "Bank icons must not depend on third party font availability");
    }

    @Test
    void oldCapturedNextPrimaryActionsDoNotReplaceTheSharedVioletBrand() throws Exception {
        String theme = Files.readString(staticRoot().resolve("css/mv-theme-nov18.css"));
        assertTrue(theme.contains("--mv-brand-violet: #9C83FF"));
        assertTrue(theme.contains(":is(a, button)[class~="), "Legacy Next actions need narrowly scoped explicit overrides");
        assertTrue(theme.contains(".mv-brand-action"));
        for (String actionColor : new String[]{"bg-emerald-500", "bg-emerald-600/90", "bg-cyan-500", "bg-cyan-600", "bg-blue-600/10"}) {
            assertTrue(theme.contains("[class~=\"" + actionColor + "\"]"), actionColor + " has no violet action override");
        }
        assertTrue(theme.contains("--mv-status-success: #4ADE80"), "Positive financial state stays green");
        assertTrue(theme.contains("--mv-status-danger: #FB7185"), "Negative financial state stays rose");
        assertFalse(theme.contains(".wallet-positive { color: var(--mv-brand-violet)"), "Do not recolor verified gains violet");
    }

    @Test
    void springThymeleafAdminAndMemberLayoutsShareVioletFocusAndActiveIndication() throws Exception {
        Path templates = Path.of(Nov18VioletBrandContractTest.class.getResource("/templates/").toURI());
        String chrome = Files.readString(templates.resolve("shared/chrome.html"), StandardCharsets.UTF_8);
        // The v10 revamp (34c7bbb387, 2026-11-24) moved the Thymeleaf chrome to
        // versioned mv43 stylesheets; every chrome stylesheet must still be
        // pinned to exact bytes. The violet file itself keeps its contract below.
        java.util.regex.Matcher links = java.util.regex.Pattern.compile("href=\"(/assets/mv43/[a-z0-9-]+\\.css)\\?v=([0-9a-f]{64})\"").matcher(chrome);
        int pinned = 0;
        while (links.find()) {
            byte[] bytes = Files.readAllBytes(staticRoot().resolve(links.group(1).substring(1)));
            String digest = java.util.HexFormat.of().formatHex(java.security.MessageDigest.getInstance("SHA-256").digest(bytes));
            assertEquals(digest, links.group(2), links.group(1) + " must serve exact versioned stylesheet bytes");
            pinned++;
        }
        assertTrue(pinned > 0, "Native Spring chrome must link pinned stylesheets");
        String css = Files.readString(staticRoot().resolve("css/mv-brand-violet.css"));
        assertTrue(css.contains("#9C83FF"));
        assertTrue(css.contains(".admin-v40"));
        assertTrue(css.contains(":focus-visible"));
        assertFalse(css.contains(".wallet-positive"), "Finance status styling is not branding");
        assertFalse(css.contains(".wallet-negative"), "Finance loss styling is not branding");
    }
}
