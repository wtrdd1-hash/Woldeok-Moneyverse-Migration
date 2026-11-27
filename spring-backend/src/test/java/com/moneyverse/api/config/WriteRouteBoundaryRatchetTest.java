package com.moneyverse.api.config;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Ratchet toward deny-by-default. The main filter chain still permits every request and leaves
 * authorization to filters and controllers; the 2026-11-26 inventory found 218 write routes
 * outside both boundary filters, 42 of which check the session but not CSRF. Converting those
 * needs Test verification of every caller, so the current set is frozen here: a new write route
 * outside the boundary fails this test until it is moved behind the filter or deliberately listed.
 */
@SpringBootTest(properties={"moneyverse.app-base-url=https://easy-scraping.com","moneyverse.scheduling.enabled=false"})
@ActiveProfiles("test")
class WriteRouteBoundaryRatchetTest {
    @Autowired @Qualifier("requestMappingHandlerMapping") RequestMappingHandlerMapping mapping;
    @Autowired AdminApiBoundaryFilter admin;
    @Autowired SensitiveApiBoundaryFilter sensitive;

    @Test void noNewWriteRouteEscapesTheBoundaryFilters() throws Exception {
        Set<String> listed = new TreeSet<>();
        try (InputStream in = getClass().getResourceAsStream("/security/uncovered-write-routes.txt")) {
            assertNotNull(in, "baseline file missing");
            for (String line : new String(in.readAllBytes(), StandardCharsets.UTF_8).split("\n")) {
                if (!line.isBlank() && !line.startsWith("#")) listed.add(line.trim());
            }
        }
        Set<String> uncovered = new TreeSet<>();
        mapping.getHandlerMethods().forEach((info, hm) -> {
            for (var m : info.getMethodsCondition().getMethods()) {
                String method = m.name();
                if (method.equals("GET") || method.equals("HEAD") || method.equals("OPTIONS")) continue;
                for (String pattern : info.getPatternValues()) {
                    var request = new MockHttpServletRequest(method, pattern.replaceAll("\\{[^}]+}", "x"));
                    if (admin.shouldNotFilter(request) && sensitive.shouldNotFilter(request)) {
                        uncovered.add(method + " " + pattern);
                    }
                }
            }
        });
        Set<String> added = new TreeSet<>(uncovered);
        added.removeAll(listed);
        assertTrue(added.isEmpty(), "Write routes outside the boundary filters (move them behind the filter, "
                + "or list them with a reason in security/uncovered-write-routes.txt): " + added);
        Set<String> stale = new TreeSet<>(listed);
        stale.removeAll(uncovered);
        assertTrue(stale.isEmpty(), "Routes now covered or removed; delete them from the baseline: " + stale);
    }
}
