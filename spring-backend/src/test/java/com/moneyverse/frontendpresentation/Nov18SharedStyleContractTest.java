package com.moneyverse.frontendpresentation;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.stream.Stream;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

/** Prevent visual changes to one page from silently breaking the November 18 shared shell. */
class Nov18SharedStyleContractTest {
    private static Path staticRoot() throws Exception {
        return Path.of(Nov18SharedStyleContractTest.class.getResource("/static/").toURI());
    }

    @Test
    void everyStaticPageUsesTheApprovedSharedThemeAndShellPagesUseOneNavigationContract() throws Exception {
        Path root = staticRoot();
        List<Path> pages;
        try (Stream<Path> stream = Files.list(root)) {
            pages = stream.filter(path -> path.toString().endsWith(".html")).toList();
        }
        assertTrue(pages.size() >= 59, "No reduction in source static page coverage");
        long navigationPages = 0;
        for (Path page : pages) {
            String html = Files.readString(page, StandardCharsets.UTF_8);
            assertTrue(html.contains("href=\"/css/mv-theme-nov18.css\""), page + " missing shared palette");
            if (html.contains("class=\"mobile-bottom-dock\"")) {
                navigationPages++;
                assertTrue(html.contains("href=\"/css/mv-shell-nov18.css\""), page + " missing the shared desktop/mobile shell");
                assertTrue(html.contains("class=\"home-sidebar\""), page + " missing desktop shell");
                String dock = html.substring(html.indexOf("class=\"mobile-bottom-dock\""));
                dock = dock.substring(0, dock.indexOf("</nav>"));
                assertEquals(5, dock.split("<a ", -1).length - 1, page + " must retain the five mobile tabs");
            }
        }
        assertTrue(navigationPages >= 28, "Expected the current 28 shared-shell member pages");
    }

    @Test
    void legacyNextBodyCannotUndoTheApprovedPalette() throws Exception {
        String theme = Files.readString(staticRoot().resolve("css/mv-theme-nov18.css"));
        assertTrue(theme.contains("body[class*=\"bg-[#\"]"), "Legacy Next background must be normalized in the shared stylesheet");
        assertTrue(theme.contains("background-color: var(--mv-bg-base) !important"), "Approved navy background must win over legacy body utilities");
        assertTrue(theme.contains("--mv-bg-base: #0C1020"));
        assertTrue(theme.contains("--mv-bg-surface: #151D32"));
        assertTrue(theme.contains("--mv-brand-violet: #9C83FF"));
    }

    @Test
    void mobileDockAndChatReserveSafeAreaWithoutShrinkingTapTargets() throws Exception {
        String shell = Files.readString(staticRoot().resolve("css/mv-shell-nov18.css"));
        assertTrue(shell.contains("env(safe-area-inset-bottom)"), "The mobile dock must account for notches and gesture areas");
        assertTrue(shell.contains("min-width: 44px"), "Mobile tabs need at least 44px tap targets");
        assertTrue(shell.contains("height: calc(60px + env(safe-area-inset-bottom))"));
        assertTrue(shell.contains("body:has(.mobile-bottom-dock)"), "Avoid hiding page content below fixed navigation");
    }
}
