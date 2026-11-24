package com.moneyverse.frontendpresentation;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.stream.Stream;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

/** The owner-approved violet identity must remain consistent on archived Next capture routes. */
class Nov18LegacyVioletAdapterTest {
    private static Path root() throws Exception {
        return Path.of(Nov18LegacyVioletAdapterTest.class.getResource("/static/").toURI());
    }

    @Test
    void everyCapturedNextPageLoadsTheSameVersionedVioletAdapterLast() throws Exception {
        List<Path> paths;
        Path staticRoot = root();
        try (Stream<Path> files = Files.walk(staticRoot)) {
            paths = files.filter(p -> p.toString().endsWith(".html")).filter(p -> !p.getParent().equals(staticRoot)).toList();
        }
        int captured = 0, independent = 0;
        for (Path path : paths) {
            String html = Files.readString(path, StandardCharsets.UTF_8);
            if (!html.contains("/_next/static/css/")) {
                independent++;
                assertFalse(html.contains("mv-legacy-violet.css"), path + " non-Next route must not be patched");
                assertTrue(html.contains("--mv-primary: #9c83ff;"), path + " standalone legacy brand token is not Nov18 violet");
                continue;
            }
            captured++;
            assertTrue(html.contains("href=\"/css/mv-legacy-violet.css?v="), path + " missing adapter");
            assertTrue(html.contains("/_next/static/css/5f13fc286907515d.css"), path + " missing the stored complete Tailwind base");
            assertFalse(html.contains("828951deb2af2cbe.css"), path + " references missing Tailwind CSS");
            assertFalse(html.contains("9d01d690ff7707f0.css"), path + " references missing Tailwind CSS");
            assertEquals(1, html.split("/css/mv-legacy-violet.css", -1).length - 1, path + " duplicate adapter");
            assertTrue(html.indexOf("/css/mv-legacy-violet.css") < html.indexOf("</head>"), path + " adapter outside head");
            assertTrue(html.lastIndexOf("<link ") < html.indexOf("</head>"), path + " malformed head");
        }
        assertEquals(222, captured, "Captured Next page census must be intentional");
        assertEquals(9, independent, "Other standalone native pages are out of scope");
    }

    @Test
    void violetStylesAreLimitedToInteractiveBrandAndPreserveFinancialStateSemantics() throws Exception {
        String css = Files.readString(root().resolve("css/mv-legacy-violet.css"));
        assertTrue(css.contains("--mv-brand-violet: #9C83FF"));
        assertTrue(css.contains("--primary: #9C83FF"), "Tailwind Next primary token must map to the same brand violet");
        assertTrue(css.contains("--ring: #9C83FF"), "Tailwind focus ring must map to violet");
        assertTrue(css.contains("--background: #0C1020"), "Nov18 header and docks must use navy instead of legacy white theme");
        assertTrue(css.contains("nav[aria-label=\"Mobile Navigation\"]"), "Mobile dock must share dark brand chrome");
        assertTrue(css.contains("html, body {"), "Some archived Next resets are absent; body margin must not shift all mobile UI");
        assertTrue(css.contains("margin: 0"), "Captured Next pages should not have an 8px browser default margin");
        assertTrue(css.contains("[aria-current=\"page\"]"));
        assertTrue(css.contains("[class~=\"bg-emerald-600\"]"));
        assertTrue(css.contains("[class~=\"bg-cyan-600\"]"));
        assertTrue(css.contains(":focus-visible"));
        assertFalse(css.contains(".wallet-positive"));
        assertFalse(css.contains(".wallet-negative"));
        assertFalse(css.contains("body [class*=\"text-emerald\"]"), "Never recolor ledger gains globally");
        assertTrue(css.contains(".moneyverse-site-header"), "Brand text exceptions must remain in site header");
        assertFalse(css.contains(".status-success"));
    }
}
